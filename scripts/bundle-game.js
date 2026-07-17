const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'game.html');
const dst = path.join(__dirname, '..', 'assets', 'gameHtml.js');

let html = fs.readFileSync(src, 'utf-8');

// Copy apple-touch-icon to assets
const iconSrc = path.join(__dirname, '..', 'www', 'apple-touch-icon.png');
const iconDst = path.join(__dirname, '..', 'assets', 'apple-touch-icon.png');
if (fs.existsSync(iconSrc)) fs.copyFileSync(iconSrc, iconDst);

// Escape and wrap as JS module
const escaped = JSON.stringify(html);
const output = `// Auto-generated from game.html\nexport const gameHtml = ${escaped};\n`;
fs.writeFileSync(dst, output);

console.log('Game bundled into assets/gameHtml.js (' + (Buffer.byteLength(output) / 1024).toFixed(1) + ' KB)');
