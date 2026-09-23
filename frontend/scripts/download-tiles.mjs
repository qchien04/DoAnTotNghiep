/**
 * StayConnect Brute-Force Tile Downloader
 * Tải toàn bộ các mảnh bản đồ (tiles) của Việt Nam về thư mục public/tiles/
 * để tự host hoàn toàn offline, 100% không phụ thuộc internet hay server bên ngoài.
 */
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, '../public/tiles/hot');
const CONCURRENCY = 15; // Số luồng tải đồng thời

// Chuyển đổi tọa độ [lat, lng] thành chỉ số tile [x, y]
function latLngToTile(lat, lon, zoom) {
  const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, zoom)
  );
  return { x, y };
}

// Tạo danh sách các tile cần tải cho một bounding box
function getTilesForBbox(minLat, maxLat, minLng, maxLng, zooms) {
  const tiles = [];
  for (const z of zooms) {
    const p1 = latLngToTile(maxLat, minLng, z);
    const p2 = latLngToTile(minLat, maxLng, z);
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        tiles.push({ z, x, y });
      }
    }
  }
  return tiles;
}

// 1. Toàn bộ lãnh thổ & vùng biển Việt Nam (bao quát)
const vietnamTiles = getTilesForBbox(6.0, 24.0, 101.5, 118.5, [5, 6, 7, 8, 9]);

// 2. Khu vực Hà Nội (chi tiết từng đường phố, ngõ ngách tìm phòng trọ)
const hanoiTiles = getTilesForBbox(20.90, 21.15, 105.70, 105.95, [10, 11, 12, 13, 14, 15]);

// 3. Khu vực Hoàng Sa & Trường Sa (chi tiết hải đảo)
const hoangSaTiles = getTilesForBbox(15.5, 17.5, 111.0, 113.0, [10, 11]);
const truongSaTiles = getTilesForBbox(7.5, 12.0, 111.5, 116.5, [10, 11]);

// Loại bỏ các tile trùng lặp
const allTilesMap = new Map();
[...vietnamTiles, ...hanoiTiles, ...hoangSaTiles, ...truongSaTiles].forEach((t) => {
  allTilesMap.set(`${t.z}/${t.x}/${t.y}`, t);
});

const allTiles = Array.from(allTilesMap.values());
console.log(`[StayConnect Tile Downloader] Tổng số tiles cần tải: ${allTiles.length}`);
console.log(`- Lưu vào: ${OUTPUT_DIR}`);

// Tải một tile
function downloadTile(tile) {
  return new Promise((resolve) => {
    const { z, x, y } = tile;
    const dir = path.join(OUTPUT_DIR, String(z), String(x));
    const filePath = path.join(dir, `${y}.png`);

    // Nếu tile đã tồn tại thì bỏ qua
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
      return resolve({ tile, status: 'EXISTS' });
    }

    fs.mkdirSync(dir, { recursive: true });

    const url = `https://nuoclen.com/tiles/hot/${z}/${x}/${y}.png`;

    https
      .get(url, { headers: { 'User-Agent': 'StayConnectTileDownloader/1.0' } }, (res) => {
        if (res.statusCode === 200) {
          const fileStream = fs.createWriteStream(filePath);
          res.pipe(fileStream);
          fileStream.on('finish', () => resolve({ tile, status: 'OK' }));
          fileStream.on('error', () => resolve({ tile, status: 'ERROR' }));
        } else {
          resolve({ tile, status: `HTTP_${res.statusCode}` });
        }
      })
      .on('error', (err) => {
        resolve({ tile, status: `ERR_${err.message}` });
      });
  });
}

// Bộ điều phối tải đa luồng
async function run() {
  let completed = 0;
  let active = 0;
  let index = 0;

  return new Promise((resolve) => {
    function next() {
      if (completed >= allTiles.length) {
        return resolve();
      }

      while (active < CONCURRENCY && index < allTiles.length) {
        const tile = allTiles[index++];
        active++;

        downloadTile(tile).then((result) => {
          active--;
          completed++;
          const percent = ((completed / allTiles.length) * 100).toFixed(1);
          if (completed % 50 === 0 || completed === allTiles.length) {
            process.stdout.write(`\r[Tiến độ: ${percent}%] Đã tải: ${completed}/${allTiles.length} tiles...`);
          }
          next();
        });
      }
    }

    next();
  });
}

const startTime = Date.now();
run().then(() => {
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n Hoàn tất tải ${allTiles.length} tiles trong ${duration}s!`);
  console.log(` Toàn bộ bản đồ hiện đã nằm 100% OFFLINE tại: public/tiles/hot/`);
});
