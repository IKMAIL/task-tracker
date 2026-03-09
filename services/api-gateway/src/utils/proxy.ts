import { createProxyMiddleware } from 'http-proxy-middleware';
import express, { Request, Response } from 'express';
import http from 'http';
import url from 'url';

export const createProxy = (target: string, pathRewrite: Record<string, string>) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      error: (err: Error, _req: Request, res: Response | http.ServerResponse, _target?: string | Partial<url.Url>) => {
        console.error(`Proxy error to ${target}:`, err.message);
        (res as express.Response).status(502).json({ success: false, error: { message: 'Service unavailable' } });
      },
    },
  });
