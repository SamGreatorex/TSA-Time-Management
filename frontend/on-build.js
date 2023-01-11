var fs = require('fs');
console.log('Updating build info...');
const data = { buildDate: new Date().toISOString() };
fs.writeFile('public/release.json', JSON.stringify(data), function (err) {
  if (err) throw err;
  console.log('Build info updated: \r\n', JSON.stringify(data, null, 2));
});
