const taskRepository = require('../repositories/taskRepository');

exports.createTask = async (dto, createdBy) => {
  if (new Date(dto.dueDate) <= new Date(dto.plannedStartDate)) {
    const err = new Error('Due date must be after planned start date');
    err.status = 400;
    throw err;
  }
  return taskRepository.create({ ...dto, createdBy });
};

exports.listTasks = async (filters, pagination) => {
  const query = {};
  if (filters.teamId)   query.assignedTeamId = filters.teamId;
  if (filters.status)   query.status = filters.status;
  if (filters.category) query.category = filters.category;
  return taskRepository.findPaginated(query, pagination);
};

exports.getTask = async (id) => {
  const task = await taskRepository.findById(id);
  if (!task) { const e = new Error('Task not found'); e.status = 404; throw e; }
  return task;
};

exports.updateTask = async (id, data) => {
  const task = await taskRepository.updateById(id, data);
  if (!task) { const e = new Error('Task not found'); e.status = 404; throw e; }
  return task;
};

exports.cancelTask = async (id) => {
  const task = await taskRepository.updateById(id, { status: 'cancelled' });
  if (!task) { const e = new Error('Task not found'); e.status = 404; throw e; }
  return task;
};

exports.getByTeam = (teamId) => taskRepository.findByTeam(teamId);

exports.getSummary = () => taskRepository.summary();

// Called internally by progress-service via SERVICE_TOKEN
exports.syncProgress = (id, data) => taskRepository.updateById(id, data);
