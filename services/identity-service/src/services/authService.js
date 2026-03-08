const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const userRepository = require('../repositories/userRepository');
const { clientId, tenantId } = require('../config/msalConfig');

exports.register = async ({ name, email, password, role }) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepository.create({ name, email, passwordHash, role });
  return { id: user._id, name: user.name, email: user.email, role: user.role };
};

exports.login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const payload = { sub: user._id, email: user.email, role: user.role, teamId: user.teamId };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, teamId: user.teamId },
  };
};

exports.microsoftLogin = async (idToken) => {
  const client = jwksClient({
    jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
  });
  const getKey = (header, callback) => {
    client.getSigningKey(header.kid, (err, key) => {
      callback(err, key?.getPublicKey());
    });
  };

  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(idToken, getKey, { audience: clientId }, (err, payload) => {
      if (err) {
        const e = new Error('Invalid Microsoft token');
        e.status = 401;
        return reject(e);
      }
      resolve(payload);
    });
  });

  const msId  = decoded.oid;
  const email = (decoded.preferred_username || decoded.email || '').toLowerCase();
  const name  = decoded.name || email;

  let user = await userRepository.findByMicrosoftId(msId);
  if (!user && email) user = await userRepository.findByEmail(email);

  if (!user) {
    user = await userRepository.create({
      name, email, microsoftId: msId, authProvider: 'microsoft', passwordHash: 'OAUTH',
    });
  } else if (!user.microsoftId) {
    await userRepository.updateById(user._id, { microsoftId: msId, authProvider: 'microsoft' });
  }

  const payload = { sub: user._id, email: user.email, role: user.role, teamId: user.teamId };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, teamId: user.teamId },
  };
};
