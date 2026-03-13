import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import * as userRepository from '../repositories/userRepository';
import msalConfig from '../config/msalConfig';
import { logger } from '@task-tracker/utils';

const { clientId, tenantId } = msalConfig;

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

const jwksClientInstance = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
  cache: true,
  cacheMaxAge: 600000,
});

function verifyIdToken(idToken: string): Promise<jwt.JwtPayload> {
  logger.debug('authService.verifyIdToken', { audience: clientId });
  const getKey: jwt.GetPublicKeyOrSecret = (header, callback) => {
    logger.debug('authService.verifyIdToken: fetching signing key', { kid: header.kid });
    jwksClientInstance.getSigningKey(header.kid as string, (err, key) => {
      callback(err, key?.getPublicKey());
    });
  };
  return new Promise((resolve, reject) => {
    jwt.verify(idToken, getKey, { audience: clientId }, (err, decoded) => {
      if (err || !decoded) {
        logger.warn('authService.verifyIdToken: invalid token', { error: (err as Error)?.message });
        const e = new Error('Invalid Microsoft token') as Error & { status: number };
        e.status = 401;
        return reject(e);
      }
      const payload = decoded as jwt.JwtPayload;
      logger.debug('authService.verifyIdToken result', { oid: payload.oid, email: payload.preferred_username || payload.email, name: payload.name });
      resolve(payload);
    });
  });
}

function roleFromGroups(groups: string[]): 'admin' | 'member' {
  const adminGroupId = process.env.ADMIN_GROUP_ID;
  if (adminGroupId && groups.includes(adminGroupId)) {
    return 'admin';
  }
  return 'member';
}

function issueToken(
  user: { _id: unknown; name: string; email: string; teamId?: unknown },
  role: 'admin' | 'member',
): AuthResult {
  const payload = { sub: String(user._id), email: user.email, role, teamId: user.teamId };
  logger.debug('authService.issueToken', { sub: payload.sub, email: payload.email, role: payload.role, teamId: payload.teamId });
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '8h') as unknown as number,
  });
  logger.debug('authService.issueToken: token signed', { sub: payload.sub });
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role, teamId: user.teamId },
  };
}

export async function microsoftLogin(idToken: string): Promise<AuthResult> {
  const decoded = await verifyIdToken(idToken);
  const msId = decoded.oid as string;
  const email = ((decoded.preferred_username || decoded.email || '') as string).toLowerCase();
  const name = (decoded.name as string) || email;
  const groups = (decoded.groups as string[]) || [];
  const role = roleFromGroups(groups);
  logger.debug('authService.microsoftLogin: decoded token claims', { msId, email, name, groups, role });

  let user = await userRepository.findByMicrosoftId(msId);
  if (!user && email) {
    logger.debug('authService.microsoftLogin: no user by microsoftId, falling back to email lookup', { msId, email });
    user = await userRepository.findByEmail(email);
  }

  if (!user) {
    const created = await userRepository.create({ name, email, microsoftId: msId, authProvider: 'microsoft' });
    logger.info('microsoft login: new user created', { userId: String(created._id), email, role });
    return issueToken(created, role);
  }

  if ((user as any).isActive === false) {
    logger.warn('microsoft login: account deactivated', { userId: String(user._id), email });
    const err = new Error('Account deactivated') as Error & { status: number };
    err.status = 403;
    throw err;
  }

  if (!user.microsoftId) {
    logger.info('microsoft login: auto-linking existing account', { userId: String(user._id), email, role });
    const updated = await userRepository.updateById(String(user._id), { microsoftId: msId, authProvider: 'microsoft' });
    return issueToken(updated!, role);
  }

  logger.info('microsoft login: success', { userId: String(user._id), email, role });
  return issueToken(user, role);
}
