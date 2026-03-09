const services = {
  IDENTITY_URL:  process.env.IDENTITY_SERVICE_URL  || 'http://localhost:3001',
  TASK_URL:      process.env.TASK_SERVICE_URL       || 'http://localhost:3002',
  PROGRESS_URL:  process.env.PROGRESS_SERVICE_URL   || 'http://localhost:3003',
  ALERT_URL:     process.env.ALERT_SERVICE_URL      || 'http://localhost:3004',
};

export default services;
