const fetch = require('node-fetch');
const progressRepository = require('../repositories/progressRepository');

const syncToTask = async (taskId, syncData) => {
  const url = `${process.env.TASK_SERVICE_URL}/tasks/${taskId}/progress-sync`;
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Token': process.env.SERVICE_TOKEN,
      },
      body: JSON.stringify(syncData),
    });
    if (!res.ok) {
      console.error(`Task sync failed for ${taskId}: HTTP ${res.status}`);
    }
  } catch (err) {
    // Fire-and-forget: log error but don't fail the progress update
    console.error(`Task sync error for ${taskId}:`, err.message);
  }
};

exports.logUpdate = async (dto, authorId) => {
  const update = await progressRepository.create({ ...dto, authorId });

  // Sync task state asynchronously — does not block response
  syncToTask(dto.taskId, {
    completionPct:  dto.completionPct,
    status:         dto.status,
    lastUpdatedAt:  update.recordedAt,
    nextUpdateDate: dto.nextUpdateDate || null,
  });

  return update;
};

exports.getHistory = (taskId) => progressRepository.findByTask(taskId);

exports.getLatest = (taskId) => progressRepository.findLatestByTask(taskId);

exports.getTeamUpdates = (teamId) => progressRepository.findByTeam(teamId);
