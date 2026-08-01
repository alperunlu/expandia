const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'game.html');
const dst = path.join(__dirname, '..', 'assets', 'gameHtml.js');

let html = fs.readFileSync(src, 'utf-8');

// Export as a plain JS string. The WebView must receive this via source={{ html }},
// which maps to WKWebView's loadHTMLString:. Passing it as a data: URI instead makes
// react-native-webview fall into its loadFileURL: branch (no URL host), and WKWebView
// raises an NSException for non-file URLs — an uncatchable native crash.
const output = `// Auto-generated from game.html — do not edit; run "npm run bundle"
export const gameHtml = ${JSON.stringify(html)};
`;
fs.writeFileSync(dst, output);

console.log('Game bundled (' + (Buffer.byteLength(output) / 1024).toFixed(1) + ' KB)');
