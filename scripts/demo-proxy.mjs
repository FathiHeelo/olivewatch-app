// Demo proxy: serves the Expo web app and the AI gateway behind ONE origin (http://localhost:8090), so a browser that
// blocks page-initiated requests to another port (e.g. the Claude desktop app's built-in browser pane) can still use
// the real Gemini gateway. Built-in modules only.
//
//   /ai/*  and  /health   ->  gateway   http://localhost:8787
//   everything else        ->  Expo web http://localhost:8081   (WebSocket upgrades too, for Metro HMR)
//
// Bodies are streamed untouched (image uploads up to the gateway's 5 MB limit work). Only one header is changed: the
// `Origin` header is removed on requests to the gateway. The page and the proxy are the same origin, so there is no
// cross-origin request left to protect, and the gateway (which allows requests without an Origin, like a native app)
// does not need to list this origin. The gateway's code and .env are not touched.
// One log line per request: method, path (no query string), target, status. Never headers or bodies.
import http from 'node:http';

const PORT = Number(process.env.DEMO_PROXY_PORT || 8090);
const GATEWAY = { name: 'gateway', host: 'localhost', port: 8787 };
const EXPO = { name: 'expo', host: 'localhost', port: 8081 };

const pick = (url = '/') => (url === '/health' || url.startsWith('/health?') || url.startsWith('/ai/') ? GATEWAY : EXPO);
const pathOnly = (url = '/') => url.split('?')[0];
const log = (...parts) => console.log(new Date().toISOString().slice(11, 19), ...parts);

const server = http.createServer((req, res) => {
  const target = pick(req.url);
  const headers = { ...req.headers };
  if (target === GATEWAY) delete headers.origin;
  const up = http.request({ host: target.host, port: target.port, method: req.method, path: req.url, headers }, (upRes) => {
    res.writeHead(upRes.statusCode ?? 502, upRes.headers);
    upRes.pipe(res);
    upRes.on('end', () => log(req.method, pathOnly(req.url), '->', target.name, upRes.statusCode));
  });
  up.on('error', (err) => {
    log(req.method, pathOnly(req.url), '->', target.name, 502, `(${err.code || 'upstream error'})`);
    if (!res.headersSent) res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'proxy_upstream_unreachable', target: target.name }));
  });
  res.on('close', () => up.destroy());
  req.pipe(up);
});

// WebSocket (Metro HMR): replay the upgrade request against Expo and pipe the two sockets together.
server.on('upgrade', (req, socket, head) => {
  socket.on('error', () => {});
  const up = http.request({ host: EXPO.host, port: EXPO.port, method: req.method, path: req.url, headers: req.headers });
  up.on('upgrade', (upRes, upSocket, upHead) => {
    upSocket.on('error', () => socket.destroy());
    socket.on('close', () => upSocket.destroy());
    const raw = [`HTTP/1.1 ${upRes.statusCode} ${upRes.statusMessage}`];
    for (let i = 0; i < upRes.rawHeaders.length; i += 2) raw.push(`${upRes.rawHeaders[i]}: ${upRes.rawHeaders[i + 1]}`);
    socket.write(raw.join('\r\n') + '\r\n\r\n');
    if (upHead?.length) socket.write(upHead);
    if (head?.length) upSocket.write(head);
    upSocket.pipe(socket).pipe(upSocket);
    log('WS', pathOnly(req.url), '->', EXPO.name, upRes.statusCode);
  });
  up.on('response', () => socket.destroy());
  up.on('error', () => socket.destroy());
  up.end();
});

server.on('clientError', (_err, socket) => socket.destroy());
process.on('uncaughtException', (err) => log('proxy error (ignored):', err.code || err.message));

server.listen(PORT, () => {
  log(`demo proxy on http://localhost:${PORT}  (/ai/* and /health -> :${GATEWAY.port}, everything else -> :${EXPO.port})`);
});
