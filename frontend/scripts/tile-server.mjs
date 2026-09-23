/**
 * StayConnect Standalone Tile Server (Node.js)
 * Tự host và cache các mảnh bản đồ (tiles) cục bộ, hoàn toàn không phụ thuộc bên ngoài
 */
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.TILE_PORT || 8090;
const CACHE_DIR = path.resolve(__dirname, '../.cache/tiles');

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const url = req.url || '';
  // Khớp định dạng: /tiles/hot/:z/:x/:y.png hoặc /tiles/:z/:x/:y.png
  const match = url.match(/^\/tiles\/(hot\/)?(\d+)\/(\d+)\/(\d+)\.png/);
  if (!match) {
    if (url === '/health' || url === '/') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(JSON.stringify({ status: 'OK', message: 'StayConnect Tile Server is running', cacheDir: CACHE_DIR }));
    }
    res.statusCode = 404;
    return res.end('Not Found');
  }

  const [, , z, x, y] = match;
  const tileFileName = `${z}_${x}_${y}.png`;
  const tileFilePath = path.join(CACHE_DIR, tileFileName);

  // 1. Phục vụ ngay lập tức từ Cache cục bộ nếu đã có
  if (fs.existsSync(tileFilePath)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Tile-Cache', 'HIT');
    return fs.createReadStream(tileFilePath).pipe(res);
  }

  // 2. Kéo ảnh từ upstream HOT OpenStreetMap và lưu vào cache
  const upstreamUrl = `https://nuoclen.com/tiles/hot/${z}/${x}/${y}.png`;
  https.get(upstreamUrl, { headers: { 'User-Agent': 'StayConnectTileServer/1.0' } }, (upstreamRes) => {
    if (upstreamRes.statusCode === 200) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('X-Tile-Cache', 'MISS');

      const fileStream = fs.createWriteStream(tileFilePath);
      upstreamRes.pipe(fileStream);
      upstreamRes.pipe(res);
    } else {
      res.statusCode = upstreamRes.statusCode || 404;
      res.end();
    }
  }).on('error', (err) => {
    console.error(`[TileServer Error for ${z}/${x}/${y}]:`, err.message);
    res.statusCode = 502;
    res.end('Upstream tile error');
  });
});

server.listen(PORT, () => {
  console.log(`[StayConnect Tile Server] Đang chạy tại http://localhost:${PORT}`);
  console.log(`- Endpoint: http://localhost:${PORT}/tiles/hot/{z}/{x}/{y}.png`);
  console.log(`- Thư mục cache: ${CACHE_DIR}`);
});
