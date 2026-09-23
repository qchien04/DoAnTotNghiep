import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';
import https from 'https';

function tileServerPlugin(): Plugin {
  return {
    name: 'vite-tile-server',
    configureServer(server) {
      const cacheDir = path.resolve(__dirname, '.cache/tiles');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        const match = url.match(/^\/tiles\/(hot\/)?(\d+)\/(\d+)\/(\d+)\.png/);
        if (!match) return next();

        const [, , z, x, y] = match;
        const tileFilePath = path.join(cacheDir, `${z}_${x}_${y}.png`);

        if (fs.existsSync(tileFilePath)) {
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          res.setHeader('X-Tile-Cache', 'HIT');
          return fs.createReadStream(tileFilePath).pipe(res);
        }

        const upstreamUrl = `https://nuoclen.com/tiles/hot/${z}/${x}/${y}.png`;
        https.get(upstreamUrl, { headers: { 'User-Agent': 'StayConnectDevServer/1.0' } }, (upstreamRes) => {
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
          console.error('[TileServer Error]:', err.message);
          res.statusCode = 502;
          res.end('Tile fetch error');
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), tileServerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});

