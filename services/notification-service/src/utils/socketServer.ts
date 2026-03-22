import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '@task-tracker/utils';

let io: SocketServer | null = null;

export function initSocketServer(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      return next(new Error('Authentication error: no token'));
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { sub: string };
      (socket as Socket & { userId: string }).userId = payload.sub;
      next();
    } catch {
      next(new Error('Authentication error: invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as Socket & { userId: string }).userId;
    void socket.join(`user:${userId}`);
    logger.debug('socket: user connected', { userId, socketId: socket.id });

    socket.on('catch_up', async ({ lastSeenAt }: { lastSeenAt?: string }) => {
      if (!lastSeenAt) return;
      // Lazy import to avoid circular dependency
      const { default: Notification } = await import('../models/Notification');
      const missed = await Notification.find({
        userId,
        createdAt: { $gt: new Date(lastSeenAt) },
      }).sort({ createdAt: 1 }).limit(200).lean();
      socket.emit('notification:batch', missed);
    });

    socket.on('mark_read', async ({ notificationIds }: { notificationIds: string[] }) => {
      const repo = await import('../repositories/notificationRepository');
      await repo.markRead(userId, notificationIds || []);
      const count = await repo.countUnread(userId);
      io?.to(`user:${userId}`).emit('unread_count:update', { count });
    });

    socket.on('disconnect', () => {
      logger.debug('socket: user disconnected', { userId, socketId: socket.id });
    });
  });

  return io;
}

export function getSocketServer(): SocketServer | null {
  return io;
}

export function emitToUser(userId: string, event: string, data: unknown): void {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
}
