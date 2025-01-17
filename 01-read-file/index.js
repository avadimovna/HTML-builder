const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'text.txt');

const readStream = fs.createReadStream(filePath);

readStream.pipe(process.stdout);

readStream.on('error', (error) => {
  console.error('An error occurred while reading the file:', error.message);
});
