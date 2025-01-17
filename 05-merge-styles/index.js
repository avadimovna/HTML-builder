const fs = require('fs');
const path = require('path');

const destinationPath = path.join(__dirname, 'project-dist', 'bundle.css');
const stylesPath = path.join(__dirname, 'styles');

const readPromises = [];

fs.readdir(stylesPath, { withFileTypes: true }, async (error, files) => {
  if (error) {
    console.error(error.message);
    return;
  }

  const cssFiles = files.filter(
    (file) => file.isFile() && path.extname(file.name) === '.css',
  );

  cssFiles.forEach((file) => {
    const filePath = path.join(stylesPath, file.name);
    const promise = new Promise((resolve, reject) => {
      let content = '';
      const readStream = fs.createReadStream(filePath, 'utf8');

      readStream.on('data', (chunk) => (content += chunk));
      readStream.on('end', () => resolve(content));
      readStream.on('error', (error) => reject(error));
    });
    readPromises.push(promise);
  });
  Promise.all(readPromises)
    .then((contents) => {
      const writeStream = fs.createWriteStream(destinationPath);

      contents.forEach((content) => {
        writeStream.write(content + '\n');
      });
      writeStream.end();
      writeStream.on('error', (error) => {
        console.error(error.message);
      });
    })
    .catch((error) => console.error(error.message));
});
