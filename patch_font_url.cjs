const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf-8');

code = code.replace(
  "src: url('https://static.wfonts.com/data/2016/05/04/final-fantasy-vi-snesb/Final Fantasy VI SNESb.ttf') format('truetype');",
  "src: url('/ff6.ttf') format('truetype');"
);

fs.writeFileSync('src/index.css', code);
