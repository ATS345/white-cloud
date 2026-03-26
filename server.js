/**
 * 云幕游戏商店 - 前端静态文件服务器（含 API 代理）
 * 端口: 8080 → 代理 /api 到 localhost:3000
 */
'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const FRONTEND_PORT = parseInt(process.env.FRONTEND_PORT || '8080');
const BACKEND_PORT = parseInt(process.env.BACKEND_PORT || '3000');
const STATIC_DIR = path.join(__dirname, 'frontend');

const MIME_TYPES = {
  html: 'text/html; charset=utf-8',
  htm: 'text/html; charset=utf-8',
  js: 'application/javascript',
  mjs: 'application/javascript',
  css: 'text/css',
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  eot: 'application/vnd.ms-fontobject',
  map: 'application/json',
  txt: 'text/plain',
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;

  // API 反向代理
  if (pathname.startsWith('/api') || pathname.startsWith('/health')) {
    const options = {
      hostname: 'localhost',
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `localhost:${BACKEND_PORT}`,
      },
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('[proxy error]', err.message);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: '后端服务不可用', message: err.message }));
      }
    });

    req.pipe(proxyReq, { end: true });
    return;
  }

  // 静态文件服务
  let filePath = path.join(STATIC_DIR, pathname);

  // 安全检查：防止路径穿越
  if (!filePath.startsWith(STATIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // 如果路径不存在或是目录，尝试 index.html（SPA 路由支持）
  let stat;
  try { stat = fs.statSync(filePath); } catch (e) { /* not found */ }

  if (!stat || stat.isDirectory()) {
    filePath = path.join(STATIC_DIR, 'index.html');
  }

  const ext = path.extname(filePath).slice(1).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const isHtml = ext === 'html' || ext === 'htm';

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': isHtml ? 'no-cache, no-store, must-revalidate' : 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // 文件不存在 → 返回 index.html（SPA 路由）
      try {
        const indexContent = fs.readFileSync(path.join(STATIC_DIR, 'index.html'));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
        res.end(indexContent);
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
    } else {
      console.error('[static error]', err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  }
});

server.listen(FRONTEND_PORT, () => {
  console.log(`✓ 前端服务器启动 → http://localhost:${FRONTEND_PORT}`);
  console.log(`  /api 代理 → http://localhost:${BACKEND_PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`✗ 端口 ${FRONTEND_PORT} 已被占用，请关闭占用该端口的程序后重试`);
  } else {
    console.error('服务器错误:', err.message);
  }
  process.exit(1);
});

// 优雅退出
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
