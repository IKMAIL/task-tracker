import { createProxyMiddleware } from 'http-proxy-middleware';
import { RequestHandler, Request, Response } from 'express';
import http from 'http';
import net from 'net';
import url from 'url';

export const createProxy = (target: string, pathRewrite: Record<string, string>): RequestHandler =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      error: (err: Error, _req: Request, res: Response | http.ServerResponse | net.Socket, _target?: string | Partial<url.Url>) => {
        console.error(`Proxy error to ${target}:`, err.message);
        if (res instanceof http.ServerResponse) {
          (res as Response).status(502).json({ success: false, error: { message: 'Service unavailable' } });
        }
      },
    },
  }) as RequestHandler;
