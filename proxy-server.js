const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3008',
  changeOrigin: true,
  logLevel: 'debug'
}));

app.listen(4200, () => {
  console.log('Proxy server running on http://localhost:4200');
});
