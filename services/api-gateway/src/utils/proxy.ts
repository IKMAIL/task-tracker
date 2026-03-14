import { createProxyMiddleware } from 'http-proxy-middleware';
import { RequestHandler, Request, Response } from 'express';
import http from 'http';
import net from 'net';
import url from 'url';
import { logger } from '@task-tracker/utils';

export const createProxy = (target: string, pathRewrite: Record<string, string>): RequestHandler =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      proxyReq: (proxyReq: any, req: Request) => {
        if ((req as any).syntheticJwt) {
          proxyReq.setHeader('Authorization', `Bearer ${(req as any).syntheticJwt}`);
          logger.debug('proxy: injected synthetic JWT', { target, method: req.method, path: req.path });
        }
        logger.debug('proxy request', { target, method: req.method, path: req.path, rewrittenPath: proxyReq.path });
      },
      proxyRes: (proxyRes: any, req: Request) => {
        logger.debug('proxy response', { target, method: req.method, path: req.path, status: proxyRes.statusCode });
      },
      error: (err: Error, req: Request, res: Response | http.ServerResponse | net.Socket, _target?: string | Partial<url.Url>) => {
        logger.error('proxy error', { target, error: err.message, method: req.method, path: req.path });
        if (res instanceof http.ServerResponse) {
          (res as Response).status(502).json({ success: false, error: { message: 'Service unavailable' } });
        }
      },
    },
  }) as RequestHandler;
