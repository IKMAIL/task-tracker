const teamRepository = require('../repositories/teamRepository');
const userRepository = require('../repositories/userRepository');

exports.listTeams = () => teamRepository.findAll();

exports.getTeam = async (id) => {
  const team = await teamRepository.findById(id);
  if (!team) {
    const err = new Error('Team not found');
    err.status = 404;
    throw err;
  }
  return team;
};

exports.createTeam = async (data) => {
  const existing = await teamRepository.findByName(data.name);
  if (existing) {
    const err = new Error('Team name already exists');
    err.status = 409;
    throw err;
  }
  return teamRepository.create(data);
};

exports.addMember = async (teamId, userId) => {
  const [team, user] = await Promise.all([
    teamRepository.findById(teamId),
    userRepository.findById(userId),
  ]);
  if (!team) { const e = new Error('Team not found'); e.status = 404; throw e; }
  if (!user) { const e = new Error('User not found'); e.status = 404; throw e; }
  await userRepository.updateById(userId, { teamId });
  return teamRepository.addMember(teamId, userId);
};

exports.removeMember = async (teamId, userId) => {
  const team = await teamRepository.findById(teamId);
  if (!team) { const e = new Error('Team not found'); e.status = 404; throw e; }
  await userRepository.updateById(userId, { teamId: null });
  return teamRepository.removeMember(teamId, userId);
};
