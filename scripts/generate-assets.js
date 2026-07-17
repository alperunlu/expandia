const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const RESOURCES_DIR = path.join(__dirname, '..', 'resources');
const WWW_DIR = path.join(__dirname, '..', 'www');

function crc32(d) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < d.length; i++) { c ^= d[i]; for (let j = 0; j < 8; j++) c = (c >>> 1) ^ (c & 1 ? 0xEDB88320 : 0); }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function ck(type, data) {
  const l = Buffer.alloc(4); l.writeUInt32BE(data.length);
  const t = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([t, data]));
  const cb = Buffer.alloc(4); cb.writeUInt32BE(crc);
  return Buffer.concat([l, t, data, cb]);
}

function createPNG(w, h, px) {
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = px(x, y, w, h);
      const o = y * (w * 4 + 1) + 1 + x * 4;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = a;
    }
  }
  const def = zlib.deflateSync(raw);
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ih = Buffer.alloc(13);
  ih.writeUInt32BE(w); ih.writeUInt32BE(h, 4);
  ih[8] = 8; ih[9] = 6; ih[10] = 0; ih[11] = 0; ih[12] = 0;
  return Buffer.concat([sig, ck('IHDR', ih), ck('IDAT', def), ck('IEND', Buffer.alloc(0))]);
}

// ─── App Store Icon ───
// Theme: Expandia — cyberpunk territory game
// Design: Deep void bg, glowing grid, neon "E" with ring

function icon(x, y, w, h) {
  const cx = w / 2, cy = h / 2;
  const dx = x - cx, dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxR = w / 2 * 0.96;
  const angle = Math.atan2(dy, dx);

  // Clamp to icon square (rounded rect corners)
  const cornerR = w * 0.22;
  const crnX = Math.max(0, Math.abs(dx) - (cx - cornerR));
  const crnY = Math.max(0, Math.abs(dy) - (cy - cornerR));
  const cornerDist = Math.sqrt(crnX * crnX + crnY * crnY);
  if (cornerDist > cornerR * 1.05) return [5, 7, 15, 0];

  // Smooth corner edge
  let alpha = 255;
  if (cornerDist > cornerR * 0.92) {
    const t = (cornerDist - cornerR * 0.92) / (cornerR * 0.13);
    alpha = Math.max(0, Math.min(255, Math.floor(255 * (1 - t))));
  }

  // Background: radial gradient from center
  const bgt = dist / (w * 0.5);
  const bgR = Math.floor(5 + bgt * 8);
  const bgG = Math.floor(7 + bgt * 12);
  const bgB = Math.floor(20 + bgt * 30);
  let col = [bgR, bgG, bgB, alpha];

  // Inner glow from center
  if (dist < w * 0.3) {
    const gt = 1 - dist / (w * 0.3);
    const glow = Math.floor(gt * 15);
    col = [col[0] + glow, col[1] + glow, col[2] + glow * 2, alpha];
  }

  // ─── Grid lines (subtle territory pattern) ───
  const gridSize = w / 8;
  const gx = x / gridSize, gy = y / gridSize;
  const gix = gx - Math.floor(gx), giy = gy - Math.floor(gy);
  const gridEdge = Math.min(gix, 1 - gix, giy, 1 - giy);

  if (gridEdge < 0.04 && dist < w * 0.42) {
    const gt = 1 - gridEdge / 0.04;
    const ga = Math.floor(gt * 25);
    for (let i = 0; i < 3; i++) col[i] = Math.min(255, col[i] + ga);
  }

  // ─── Resource chain ring (cyan / magenta arcs) ───
  const ringOuter = w * 0.44;
  const ringInner = w * 0.36;
  const ringMid = (ringOuter + ringInner) / 2;

  if (dist > ringInner && dist < ringOuter) {
    const ringSeg = ((angle / Math.PI + 1) / 2) * 8;
    const segIdx = Math.floor(ringSeg) % 8;
    // Alternate cyan and magenta segments
    const isCyan = segIdx % 2 === 0;
    const ringT = 1 - Math.abs(dist - ringMid) / ((ringOuter - ringInner) / 2);
    const ringA = Math.floor(ringT * 200);

    if (isCyan) {
      const glow = Math.max(0, Math.sin(ringSeg * Math.PI / 4));
      col = [
        Math.floor(43 * (0.5 + 0.5 * ringT)),
        Math.floor(231 * (0.5 + 0.5 * ringT)),
        255,
        Math.floor(alpha * ringA / 255)
      ];
    } else {
      col = [
        255,
        Math.floor(45 * (0.5 + 0.5 * ringT)),
        Math.floor(155 * (0.5 + 0.5 * ringT)),
        Math.floor(alpha * ringA / 255)
      ];
    }
  }

  // ─── Stylized "E" letter ───
  const eScale = w / 1024;
  const lx = x / w, ly = y / h;

  // Define E shape at normalized coords (center 0,0, range ~ -0.5 to 0.5)
  const sx = (lx - 0.5), sy = (ly - 0.48);

  // E is composed of:
  // Vertical bar: x in [-0.22, -0.13], y in [-0.38, 0.38]
  // Top bar: x in [-0.22, 0.18], y in [-0.38, -0.30]
  // Middle bar: x in [-0.22, 0.12], y in [-0.05, 0.03]
  // Bottom bar: x in [-0.22, 0.18], y in [0.30, 0.38]

  let inE = false;
  // Vertical bar
  if (sx >= -0.22 && sx <= -0.13 && sy >= -0.38 && sy <= 0.38) inE = true;
  // Top bar
  if (sx >= -0.22 && sx <= 0.18 && sy >= -0.38 && sy <= -0.30) inE = true;
  // Middle bar
  if (sx >= -0.22 && sx <= 0.12 && sy >= -0.05 && sy <= 0.03) inE = true;
  // Bottom bar
  if (sx >= -0.22 && sx <= 0.18 && sy >= 0.30 && sy <= 0.38) inE = true;
  // Vertical bar (thicker)
  if (sx >= -0.23 && sx <= -0.12 && sy >= -0.40 && sy <= 0.40) inE = true;

  if (inE && dist < ringInner) {
    const edgeDist = Math.min(
      Math.abs(sx + 0.175), // right edge of top bar
      Math.abs(sx + 0.115), // right edge of middle bar
      Math.abs(sx + 0.175), // right edge of bottom bar
      Math.abs(sx + 0.17),  // left edge of vertical
      Math.abs(sy + 0.34),  // edge of top bar
      Math.abs(sy),         // edge of middle bar
      Math.abs(sy - 0.34)   // edge of bottom bar
    );

    // Glow effect around E
    if (edgeDist < 0.015) {
      // Cyan glow on edges
      const gt = 1 - edgeDist / 0.015;
      col = [
        Math.floor(43 + gt * 100),
        Math.floor(231 + gt * 24),
        255,
        alpha
      ];
    } else if (edgeDist < 0.04) {
      // Outer glow
      const gt = 1 - (edgeDist - 0.015) / 0.025;
      col = [43, 200, 220, Math.floor(alpha * gt * 0.6)];
    } else {
      // Inner fill - bright cyan
      col = [43, 231, 255, alpha];
    }
  }

  // ─── Territory cell dots (small glowing squares at corners) ───
  const corners = [
    [-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]
  ];
  for (const [cdx, cdy] of corners) {
    const cDist = Math.sqrt((sx - cdx) ** 2 + (sy - cdy) ** 2);
    if (cDist < w * 0.04 / 1024 * 3) {
      const ct = 1 - cDist / (w * 0.04 / 1024 * 3);
      const ca = Math.floor(ct * 180);
      // Yellow dots representing territory cells
      col = [
        Math.floor(255 * (0.6 + 0.4 * ct)),
        Math.floor(210 * (0.6 + 0.4 * ct)),
        Math.floor(63 * (0.6 + 0.4 * ct)),
        Math.min(alpha, ca)
      ];
    }
  }

  return col;
}

// ─── Splash Screen ───
function splash(x, y, w, h) {
  const cx = w / 2, cy = h / 2;
  const dx = x - cx, dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const t = dist / (w * 0.5);

  const bgR = Math.floor(5 + t * 6);
  const bgG = Math.floor(7 + t * 6);
  const bgB = Math.floor(20 + t * 16);

  let col = [bgR, bgG, bgB, 255];

  // Draw large "E"
  const lx = x / w, ly = y / h;
  const sx = (lx - 0.5), sy = (ly - 0.48);

  let inE = false;
  if (sx >= -0.18 && sx <= -0.10 && sy >= -0.28 && sy <= 0.28) inE = true;
  if (sx >= -0.18 && sx <= 0.14 && sy >= -0.28 && sy <= -0.22) inE = true;
  if (sx >= -0.18 && sx <= 0.09 && sy >= -0.04 && sy <= 0.02) inE = true;
  if (sx >= -0.18 && sx <= 0.14 && sy >= 0.22 && sy <= 0.28) inE = true;

  if (inE) {
    const edgeDist = Math.min(
      Math.abs(sx + 0.14), Math.abs(sx + 0.09),
      Math.abs(sx + 0.14), Math.abs(sx + 0.14),
      Math.abs(sy + 0.25), Math.abs(sy), Math.abs(sy - 0.25)
    );
    if (edgeDist < 0.01) {
      const gt = 1 - edgeDist / 0.01;
      col = [Math.floor(43 + gt * 80), Math.floor(231 + gt * 20), 255, 255];
    } else {
      col = [43, Math.floor(231 * 0.9), Math.floor(255 * 0.9), Math.floor(255 * 0.85)];
    }
  }

  // Subtle ring
  const ringD = Math.abs(dist - w * 0.32);
  if (ringD < w * 0.008) {
    const rt = 1 - ringD / (w * 0.008);
    const ra = Math.floor(rt * 35);
    col = [43, 231, 255, ra];
  }

  return col;
}

const iOSIcons = [
  { name: 'icon-20@1x', size: 20 },
  { name: 'icon-20@2x', size: 40 },
  { name: 'icon-20@3x', size: 60 },
  { name: 'icon-29@1x', size: 29 },
  { name: 'icon-29@2x', size: 58 },
  { name: 'icon-29@3x', size: 87 },
  { name: 'icon-40@1x', size: 40 },
  { name: 'icon-40@2x', size: 80 },
  { name: 'icon-40@3x', size: 120 },
  { name: 'icon-60@2x', size: 120 },
  { name: 'icon-60@3x', size: 180 },
  { name: 'icon-76@1x', size: 76 },
  { name: 'icon-76@2x', size: 152 },
  { name: 'icon-83.5@2x', size: 167 },
  { name: 'icon-1024', size: 1024 },
];

function generateAll() {
  [RESOURCES_DIR, path.join(RESOURCES_DIR, 'ios', 'icon'), WWW_DIR].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  for (const ic of iOSIcons) {
    const png = createPNG(ic.size, ic.size, icon);
    fs.writeFileSync(path.join(RESOURCES_DIR, 'ios', 'icon', `${ic.name}.png`), png);
  }
  console.log('iOS icons generated.');

  const splashImg = createPNG(2732, 2732, splash);
  fs.writeFileSync(path.join(RESOURCES_DIR, 'splash.png'), splashImg);
  console.log('Splash screen generated.');

  const icon1024 = createPNG(1024, 1024, icon);
  fs.writeFileSync(path.join(RESOURCES_DIR, 'icon.png'), icon1024);
  console.log('Main icon generated.');

  const icon180 = createPNG(180, 180, icon);
  fs.writeFileSync(path.join(WWW_DIR, 'apple-touch-icon.png'), icon180);
  console.log('Apple touch icon generated.');
  console.log('All assets generated successfully!');
}

generateAll();
