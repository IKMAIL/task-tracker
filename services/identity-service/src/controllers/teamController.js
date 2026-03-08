const teamService = require('../services/teamService');

exports.list = async (req, res, next) => {
  try {
    const teams = await teamService.listTeams();
    res.json({ success: true, data: teams });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const team = await teamService.getTeam(req.params.id);
    res.json({ success: true, data: team });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const team = await teamService.createTeam(req.body);
    res.status(201).json({ success: true, data: team });
  } catch (err) { next(err); }
};

exports.addMember = async (req, res, next) => {
  try {
    const team = await teamService.addMember(req.params.id, req.body.userId);
    res.json({ success: true, data: team });
  } catch (err) { next(err); }
};

exports.removeMember = async (req, res, next) => {
  try {
    const team = await teamService.removeMember(req.params.id, req.params.userId);
    res.json({ success: true, data: team });
  } catch (err) { next(err); }
};
