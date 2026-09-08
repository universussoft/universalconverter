const fs = require('fs');
const path = require('path');
const dict = require('./unit-translations.js');

const indexPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

const start = html.indexOf('const UNIT_I18N={');
if (start === -1) throw new Error('UNIT_I18N block not found');
const end = html.indexOf('\n};', start) + 3;
const oldBlock = html.slice(start, end);

const objLiteral = oldBlock.replace('const UNIT_I18N=', '').replace(/;\s*$/, '');
// eslint-disable-next-line no-eval
const existingObj = eval('(' + objLiteral + ')');
const merged = Object.assign({}, existingObj, dict);
const keys = Object.keys(merged);
console.log('existing:', Object.keys(existingObj).length, 'dict:', Object.keys(dict).length, 'merged:', keys.length);

const lines = keys.map(function (k) {
  const v = merged[k];
  const parts = ['en', 'es', 'fr', 'de', 'zh'].map(function (l) {
    return l + ':' + JSON.stringify(v[l] || '');
  }).join(',');
  return '  ' + JSON.stringify(k) + ':{' + parts + '},';
});
const newBlock = 'const UNIT_I18N={\n' + lines.join('\n') + '\n};';

const newHtml = html.slice(0, start) + newBlock + html.slice(end);
fs.writeFileSync(indexPath, newHtml);
console.log('index.html updated, new block bytes:', newBlock.length);
