const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8088;
const FRONTEND_DIR = path.join(__dirname, '../frontend');
const MEDIA2DOC_DIR = path.join(FRONTEND_DIR, 'media2doc');
const API_PROXY = 'http://localhost:3001';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

// 代理函数
function proxyRequest(req, res, targetUrl) {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error('代理请求失败:', err);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway');
  });

  req.pipe(proxyReq, { end: true });
}

const server = http.createServer((req, res) => {
  // 设置必需的 SharedArrayBuffer 头部
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  // 代理 /api/* 请求到 3001 端口
  if (pathname.startsWith('/api/') || pathname === '/health') {
    return proxyRequest(req, res, API_PROXY);
  }

  // 处理 /media2doc 路由
  if (pathname.startsWith('/media2doc')) {
    // 移除 /media2doc 前缀，从 media2doc 目录读取文件
    let media2docPath = pathname.replace('/media2doc', '');
    // 处理没有尾斜杠的情况（如 /media2doc -> /）
    if (!media2docPath || media2docPath === '') {
      media2docPath = '/';
    }
    pathname = path.join(MEDIA2DOC_DIR, media2docPath === '/' ? 'index.html' : media2docPath);
  } else if (pathname === '/') {
    pathname = path.join(FRONTEND_DIR, 'index.html');
  } else {
    pathname = path.join(FRONTEND_DIR, pathname);
  }

  // 检查文件是否存在
  fs.exists(pathname, (exists) => {
    if (!exists) {
      // 如果文件不存在，返回 index.html（用于 SPA 应用）
      pathname = path.join(FRONTEND_DIR, 'index.html');
    }

    const ext = path.extname(pathname);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(pathname, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Frontend server running on http://localhost:${PORT}`);
  console.log(`   SharedArrayBuffer headers enabled`);
  console.log(`   Media2Doc available at /media2doc`);
  console.log(`   API proxy enabled -> localhost:3001`);
});
