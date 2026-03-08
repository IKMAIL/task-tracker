const userRepository = require('../repositories/userRepository');

exports.listUsers = () => userRepository.findAll();

exports.getUser = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
};

exports.updateUser = async (id, data) => {
  const user = await userRepository.updateById(id, data);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
};
