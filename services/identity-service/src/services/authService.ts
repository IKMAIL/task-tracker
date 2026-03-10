import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import * as userRepository from '../repositories/userRepository';
import msalConfig from '../config/msalConfig';
import { logger } from '../../../../shared/utils/src/logger';

const { clientId, tenantId } = msalConfig;

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface MergeInput {
  idToken: string;
  password: string;
}

interface UserResult {
  id: unknown;
  name: string;
  email: string;
  role: string;
  teamId?: unknown;
}

interface AuthResult {
  token: string;
  user: UserResult;
}

interface MergeRequiredResult {
  mergeRequired: true;
  email: string;
}

export async function register({ name, email, password, role }: RegisterInput): Promise<UserResult> {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    logger.warn('register: email already registered', { email });
    const err = new Error('Email already registered') as Error & { status: number };
    err.status = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepository.create({ name, email, passwordHash, role });
  logger.info('user registered', { userId: String(user._id), email, role: user.role });
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

export async function login({ email, password }: LoginInput): Promise<AuthResult> {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    logger.warn('login: user not found', { email });
    const err = new Error('Invalid credentials') as Error & { status: number };
    err.status = 401;
    throw err;
  }
  const valid = await bcrypt.compare(password, user.passwordHash ?? '');
  if (!valid) {
    logger.warn('login: invalid password', { email });
    const err = new Error('Invalid credentials') as Error & { status: number };
    err.status = 401;
    throw err;
  }
  const payload = { sub: String(user._id), email: user.email, role: user.role, teamId: user.teamId };
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as unknown as number,
  });
  logger.info('user logged in', { userId: String(user._id), email });
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, teamId: user.teamId },
  };
}

const jwksClientInstance = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
  cache: true,
  cacheMaxAge: 600000,
});

function verifyIdToken(idToken: string): Promise<jwt.JwtPayload> {
  const getKey: jwt.GetPublicKeyOrSecret = (header, callback) => {
    jwksClientInstance.getSigningKey(header.kid as string, (err, key) => {
      callback(err, key?.getPublicKey());
    });
  };
  return new Promise((resolve, reject) => {
    jwt.verify(idToken, getKey, { audience: clientId }, (err, decoded) => {
      if (err || !decoded) {
        const e = new Error('Invalid Microsoft token') as Error & { status: number };
        e.status = 401;
        return reject(e);
      }
      resolve(decoded as jwt.JwtPayload);
    });
  });
}

function issueToken(user: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  teamId?: unknown;
}): AuthResult {
  const payload = { sub: String(user._id), email: user.email, role: user.role, teamId: user.teamId };
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as unknown as number,
  });
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, teamId: user.teamId },
  };
}

export async function microsoftLogin(idToken: string): Promise<AuthResult | MergeRequiredResult> {
  const decoded = await verifyIdToken(idToken);
  const msId = decoded.oid as string;
  const email = ((decoded.preferred_username || decoded.email || '') as string).toLowerCase();
  const name = (decoded.name as string) || email;

  let user = await userRepository.findByMicrosoftId(msId);
  if (!user && email) user = await userRepository.findByEmail(email);

  if (!user) {
    const created = await userRepository.create({ name, email, microsoftId: msId, authProvider: 'microsoft' });
    logger.info('microsoft login: new user created', { userId: String(created._id), email });
    return issueToken(created);
  }

  if (!user.microsoftId) {
    logger.info('microsoft login: merge required', { email });
    return { mergeRequired: true, email: user.email };
  }

  logger.info('microsoft login: success', { userId: String(user._id), email });
  return issueToken(user);
}

export async function mergeWithMicrosoft({ idToken, password }: MergeInput): Promise<AuthResult> {
  const decoded = await verifyIdToken(idToken);
  const email = ((decoded.preferred_username || decoded.email || '') as string).toLowerCase();
  const msId = decoded.oid as string;

  const user = await userRepository.findByEmail(email);
  if (!user) {
    const e = new Error('Account not found') as Error & { status: number };
    e.status = 404;
    throw e;
  }

  const valid = await bcrypt.compare(password, user.passwordHash ?? '');
  if (!valid) {
    logger.warn('merge: incorrect password', { email });
    const e = new Error('Incorrect password') as Error & { status: number };
    e.status = 401;
    throw e;
  }

  const updated = await userRepository.updateById(String(user._id), { microsoftId: msId, authProvider: 'microsoft' });
  logger.info('microsoft account merged', { userId: String(user._id), email });
  return issueToken(updated!);
}
