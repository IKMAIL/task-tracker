const alertService = require('../services/alertService');
const alertDetector = require('../services/alertDetector');

exports.list = async (req, res, next) => {
  try {
    const { teamId, type, severity } = req.query;
    const alerts = await alertService.listAlerts({ teamId, type, severity });
    res.json({ success: true, data: alerts });
  } catch (err) { next(err); }
};

exports.getByTeam = async (req, res, next) => {
  try {
    const alerts = await alertService.listAlerts({ teamId: req.params.teamId });
    res.json({ success: true, data: alerts });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const alert = await alertService.getAlert(req.params.id);
    res.json({ success: true, data: alert });
  } catch (err) { next(err); }
};

exports.resolve = async (req, res, next) => {
  try {
    const alert = await alertService.resolveAlert(req.params.id);
    res.json({ success: true, data: alert });
  } catch (err) { next(err); }
};

exports.runDetection = async (req, res, next) => {
  try {
    // Run detection in background — respond immediately
    alertDetector.runDetection().catch((err) =>
      console.error('Background detection error:', err.message)
    );
    res.json({ success: true, data: { message: 'Detection started' } });
  } catch (err) { next(err); }
};
