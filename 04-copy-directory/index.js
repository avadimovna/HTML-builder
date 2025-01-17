const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'files');
const targetDir = path.join(__dirname, 'files-copy');

function copyFile(source, target) {
  return new Promise((resolve, reject) => {
    fs.copyFile(source, target, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function mkdir(path) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function readdir(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
}

function rmdir(path) {
  return new Promise((resolve, reject) => {
    fs.rm(path, { recursive: true, force: true }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function copyDir() {
  try {
    fs.access(targetDir, async (err) => {
      try {
        if (!err) {
          await rmdir(targetDir);
        }

        await mkdir(targetDir);

        const files = await readdir(sourceDir);

        for (const file of files) {
          const sourcePath = path.join(sourceDir, file);
          const targetPath = path.join(targetDir, file);

          try {
            await copyFile(sourcePath, targetPath);
          } catch (error) {
            console.error(error.message);
          }
        }
      } catch (error) {
        console.error(error.message);
      }
    });
  } catch (error) {
    console.error(error.message);
  }
}
copyDir();
