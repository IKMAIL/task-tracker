const log = (level: string, message: string, meta: Record<string, unknown> = {}): void => {
  process.stdout.write(
    JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...meta }) + '\n'
  );
};

export const logger = {
  info:  (msg: string, meta?: Record<string, unknown>) => log('info',  msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => log('warn',  msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
};
