const fs = require('fs').promises;
const fsRegular = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'template.html');
const componentsPath = path.join(__dirname, 'components');
const distPath = path.join(__dirname, 'project-dist');
const indexPath = path.join(distPath, 'index.html');

function readFileStream(filePath) {
  return new Promise((resolve, reject) => {
    let content = '';
    const readStream = fsRegular.createReadStream(filePath, 'utf8');

    readStream.on('data', (chunk) => (content += chunk));
    readStream.on('end', () => resolve(content));
    readStream.on('error', reject);
  });
}

async function readComponent(tag) {
  const componentPath = path.join(componentsPath, `${tag}.html`);
  try {
    await fs.access(componentPath);
    return await readFileStream(componentPath);
  } catch {
    console.error(`Компонент ${tag} не найден`);
    return '';
  }
}

async function buildPage() {
  try {
    await fs.mkdir(distPath, { recursive: true });
    await fs.copyFile(templatePath, indexPath);

    const indexContent = await readFileStream(indexPath);

    const tags = indexContent.match(/{{([^}]+)}}/g);
    if (!tags) return;

    const tagNames = tags.map((tag) => tag.slice(2, -2).trim());

    let resultContent = indexContent;
    for (const tag of tagNames) {
      const componentContent = await readComponent(tag);
      resultContent = resultContent.replace(`{{${tag}}}`, componentContent);
    }

    await fs.writeFile(indexPath, resultContent, 'utf8');
  } catch (error) {
    console.error(error.message);
  }
}

const sourceDir = path.join(__dirname, 'assets');
const targetDir = path.join(distPath, 'assets');

function copyFile(source, target) {
  return new Promise((resolve, reject) => {
    fsRegular.copyFile(source, target, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function mkdir(path) {
  return new Promise((resolve, reject) => {
    fsRegular.mkdir(path, { recursive: true }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function readdir(path) {
  return new Promise((resolve, reject) => {
    fsRegular.readdir(path, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
}

function rmdir(path) {
  return new Promise((resolve, reject) => {
    fsRegular.rm(path, { recursive: true, force: true }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function copyDir(source, target) {
  try {
    await mkdir(target);
    const files = await readdir(source);

    for (const file of files) {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);

      const stat = await fs.stat(sourcePath);

      if (stat.isDirectory()) {
        await copyDir(sourcePath, targetPath);
      } else {
        await copyFile(sourcePath, targetPath);
      }
    }
  } catch (error) {
    console.error(error.message);
  }
}

async function copyAssets() {
  try {
    try {
      await fs.access(targetDir);
      await rmdir(targetDir);
    } catch (error) {
      // Ignore the error, folder will be created soon
    }
    await copyDir(sourceDir, targetDir);
  } catch (error) {
    console.error(error.message);
  }
}

const destinationPath = path.join(__dirname, 'project-dist', 'style.css');
const stylesPath = path.join(__dirname, 'styles');

async function mergeStyles() {
  try {
    const files = await fs.readdir(stylesPath, { withFileTypes: true });

    const cssFiles = files.filter(
      (file) => file.isFile() && path.extname(file.name) === '.css',
    );

    const contents = await Promise.all(
      cssFiles.map((file) => readFileStream(path.join(stylesPath, file.name))),
    );

    await fs.writeFile(destinationPath, contents.join('\n'));
  } catch (error) {
    console.error(error.message);
  }
}

async function build() {
  try {
    await buildPage();
    await copyAssets();
    await mergeStyles();
  } catch (error) {
    console.error(error.message);
  }
}

build();
