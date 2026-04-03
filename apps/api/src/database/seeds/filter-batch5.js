const fs = require('fs');
const path = require('path');
const SEEDS = __dirname;

const MISSING = new Set([884,887,895,896,897,898,901,910,917,919,920,921,923,924,927,928,930,939,944,946,950,977,982,989,990,1001,1007,1018,1025,1028,1029,1039,1041,1048,1053,1061,1066,1070,1071,1088,1089,1095,1114,1122,1131,1132,1135,1136,1137,1140,1147,1157,1158,1159,1161,1164,1170,1172,1177,1181,1182,1184,1190,1222,1236,1241,1244,1245,1249,1291,1298,1309,1311,1321,1325,1328,1335,1338,1360,1399,1400,1401,1431,1432,1433,1436]);

function filterSql(inputFile, outputFile, productIdColumn) {
  const content = fs.readFileSync(path.join(SEEDS, inputFile), 'utf8');
  const lines = content.split('\n');
  const header = [];
  const data = [];

  for (const line of lines) {
    if (line.startsWith('--') || line.startsWith('INSERT INTO') || line.trim() === '') {
      header.push(line);
    } else {
      const m = line.match(/^\((\d+),\s*(\d+),/);
      const pid = m ? parseInt(m[productIdColumn]) : null;
      if (pid !== null && !MISSING.has(pid)) {
        data.push(line);
      }
    }
  }

  // Fix trailing punctuation
  const fixed = data.map((l, i) => {
    let clean = l.replace(/,\s*$/, '').replace(/;\s*$/, '');
    return i < data.length - 1 ? clean + ',' : clean + ';';
  });

  const out = path.join(SEEDS, outputFile);
  fs.writeFileSync(out, header.join('\n') + '\n' + fixed.join('\n'));
  console.log(`${inputFile} -> ${outputFile}: ${fixed.length} rows`);
}

// Images: (image_id, product_id, ...) - product_id is column 2
filterSql('product-images-batch5.sql', 'tmp_images_filtered.sql', 2);

// Product ingredients: (pi_id, product_id, ...) - product_id is column 2
const piFiles = fs.readdirSync(SEEDS).filter(f => f.match(/^product-ingredients-batch5-part\d+\.sql$/));
for (const f of piFiles) {
  filterSql(f, 'tmp_' + f, 2);
}

// Affiliate links: (al_id, product_id, ...) - product_id is column 2
const alFiles = fs.readdirSync(SEEDS).filter(f => f.match(/^affiliate-links-batch5-part\d+\.sql$/));
for (const f of alFiles) {
  filterSql(f, 'tmp_' + f, 2);
}

// Product labels: (pl_id, product_id, ...) - product_id is column 2
const plFiles = fs.readdirSync(SEEDS).filter(f => f.match(/^product-labels-batch5-part\d+\.sql$/));
for (const f of plFiles) {
  filterSql(f, 'tmp_' + f, 2);
}

console.log('Done! All filtered files written.');
