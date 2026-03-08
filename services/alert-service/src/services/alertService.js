const alertRepository = require('../repositories/alertRepository');

exports.listAlerts = (filters = {}) => {
  const query = {};
  if (filters.teamId)   query.teamId = filters.teamId;
  if (filters.type)     query.type = filters.type;
  if (filters.severity) query.severity = filters.severity;
  return alertRepository.findActive(query);
};

exports.getAlert = async (id) => {
  const alert = await alertRepository.findById(id);
  if (!alert) { const e = new Error('Alert not found'); e.status = 404; throw e; }
  return alert;
};

exports.resolveAlert = async (id) => {
  const alert = await alertRepository.resolveById(id);
  if (!alert) { const e = new Error('Alert not found'); e.status = 404; throw e; }
  return alert;
};
