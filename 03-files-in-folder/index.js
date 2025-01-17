const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, 'secret-folder');

fs.readdir(folderPath, { withFileTypes: true }, (error, files) => {
  if (error) {
    console.error(error.message);
  } else {
    files.forEach((file) => {
      if (file.isFile()) {
        const filePath = path.join(folderPath, file.name);
        fs.stat(filePath, (error, stats) => {
          if (error) {
            console.error(error.message);
          }
          const name = path.parse(filePath).name;
          const ext = path.parse(filePath).ext.slice(1);
          const size = stats.size;
          console.log(`${name}-${ext}-${size}b`);
        });
      }
    });
  }
});
