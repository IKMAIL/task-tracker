const { createProxyMiddleware } = require('http-proxy-middleware');

// Creates a proxy middleware that forwards requests to a target service.
// pathRewrite strips the /api/<resource> prefix before forwarding.
exports.createProxy = (target, pathRewrite) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      error: (err, req, res) => {
        console.error(`Proxy error to ${target}:`, err.message);
        res.status(502).json({ success: false, error: { message: 'Service unavailable' } });
      },
    },
  });
