const fs = require('fs');
const path = require('path');
const SEEDS = __dirname;
const MISSING = new Set([127, 132, 176, 450, 458, 459, 482, 557, 562, 861]);

for (let i = 1; i <= 3; i++) {
  const file = path.join(SEEDS, 'product-labels-batch4-part' + i + '.sql');
  if (!fs.existsSync(file)) continue;

  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  let header = '';
  let entries = [];
  let currentEntry = '';
  let inHeader = true;

  for (const line of lines) {
    if (inHeader && (line.startsWith('--') || line.startsWith('INSERT INTO'))) {
      header += line + '\n';
      if (line.startsWith('INSERT INTO')) inHeader = false;
      continue;
    }

    if (line.match(/^\(\d+,$/m) || line.match(/^\(\d+,\s*$/)) {
      if (currentEntry) entries.push(currentEntry);
      currentEntry = line;
    } else if (currentEntry) {
      currentEntry += '\n' + line;
    }
  }
  if (currentEntry) entries.push(currentEntry);

  const filtered = entries.filter(e => {
    const match = e.match(/^\((\d+),/);
    if (!match) return true;
    return !MISSING.has(parseInt(match[1]));
  });

  let result = header;
  result += filtered.map((e, idx) => {
    let cleaned = e.replace(/,\s*$/, '').replace(/;\s*$/, '');
    return idx < filtered.length - 1 ? cleaned + ',\n' : cleaned + ';';
  }).join('\n');

  const outFile = path.join(SEEDS, 'tmp_labels_part' + i + '.sql');
  fs.writeFileSync(outFile, result);
  console.log('Part ' + i + ': ' + filtered.length + ' entries -> ' + outFile);
}
