// Minimal structured logger — writes JSON lines to stdout
const log = (level, message, meta = {}) => {
  process.stdout.write(
    JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...meta }) + '\n'
  );
};

module.exports = {
  info:  (msg, meta) => log('info',  msg, meta),
  warn:  (msg, meta) => log('warn',  msg, meta),
  error: (msg, meta) => log('error', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
};
