const fs = require('fs');
const path = require('path');

const STRIDE = 112;
const FONT_DATA_FILE = '../font/font.csv';
const FONT_SCRIPT_FILE = '../font/script.sw';
const OUT_FILE = '../lib/font.sw';
const ORDER = " !©#$%&®()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[±]^_`abcdefghijklmnopqrstuvwxyz{|}~";
const INDICES = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:;<=>?@!©#$%&®()*+,-./[±]^_`{|}~";

const app_dir = path.dirname(require.main.filename);
const font_data = fs.readFileSync(path.resolve(app_dir, FONT_DATA_FILE), {encoding: 'utf-8'});
const script_data = fs.readFileSync(path.resolve(app_dir, FONT_SCRIPT_FILE), {encoding: 'utf-8'});
const values = font_data.split(',').map(x=>x.trim());


const chunks = {};
let i = 0;
for (const char of ORDER) {
    const chunk = values.slice(i, i + STRIDE);
    chunks[char] = chunk;
    i += STRIDE;
}

const ordered_data = [];
for (const char of INDICES) {
    ordered_data.push(chunks[char].join(','));
}

const result = script_data
    .replace('%indices', INDICES.split('').map(x=>`"${x}"`).join(', '))
    .replace('%fontdata', ordered_data.map(x=>`        "${x}"`).join(',\n'));

fs.writeFileSync(path.resolve(app_dir, OUT_FILE), result);