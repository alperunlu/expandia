const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'game.html');
const dst = path.join(__dirname, '..', 'assets', 'gameHtml.js');

let html = fs.readFileSync(src, 'utf-8');

// Base64 encode the HTML for safe WebView loading
const base64 = Buffer.from(html, 'utf-8').toString('base64');

const output = `// Auto-generated from game.html
export const gameHtmlBase64 = ${JSON.stringify(base64)};
export const gameHtmlLength = ${html.length};
`;
fs.writeFileSync(dst, output);

console.log('Game bundled (' + (Buffer.byteLength(output) / 1024).toFixed(1) + ' KB, base64)');
