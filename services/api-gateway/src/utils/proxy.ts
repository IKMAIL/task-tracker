import { createProxyMiddleware } from 'http-proxy-middleware';
import { RequestHandler, Request, Response } from 'express';
import http from 'http';
import net from 'net';
import url from 'url';
import { logger } from '../../../../shared/utils/src/logger';

export const createProxy = (target: string, pathRewrite: Record<string, string>): RequestHandler =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      error: (err: Error, req: Request, res: Response | http.ServerResponse | net.Socket, _target?: string | Partial<url.Url>) => {
        logger.error('proxy error', { target, error: err.message, method: req.method, path: req.path });
        if (res instanceof http.ServerResponse) {
          (res as Response).status(502).json({ success: false, error: { message: 'Service unavailable' } });
        }
      },
    },
  }) as RequestHandler;
