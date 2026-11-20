// Turns dist-single/index.html (one self-contained file) into a page fragment
// without <html>/<head>/<body> wrappers, for hosts that add their own skeleton.
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist-single/index.html', 'utf8');
const head = html.match(/<head>([\s\S]*?)<\/head>/i)[1];
const body = html.match(/<body>([\s\S]*?)<\/body>/i)[1];
const keep = head
  .replace(/<meta charset[^>]*>/i, '')
  .replace(/<meta name="viewport"[^>]*>/i, '')
  .trim();
writeFileSync('dist-single/common-room.html', `${keep}\n${body.trim()}\n`);
console.log('wrote dist-single/common-room.html');
