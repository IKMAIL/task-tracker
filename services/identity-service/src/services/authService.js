const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

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
