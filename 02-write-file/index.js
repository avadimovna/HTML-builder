const fs = require('fs');
const path = require('path');
const readLine = require('readline');

const filePath = path.join(__dirname, 'output.txt');

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const writeStream = fs.createWriteStream(filePath, { flags: 'a' });

console.log(
  'Hello! Enter text to write to file (to exit, enter "exit" or press ctrl+c):',
);

rl.on('line', (input) => {
  if (input.toLowerCase() === 'exit') {
    console.log('Goodbye! Thank you for using the program!');
    rl.close();
    writeStream.end();
    process.exit();
  } else {
    writeStream.write(input + '\n');
  }
});

rl.on('SIGINT', () => {
  closeProgram();
});

writeStream.on('error', (error) => {
  console.error('An error occurred while writing to the file:', error.message);
});

function closeProgram() {
  console.log('\nGoodbye! Thank you for using the program!');
  rl.close();
  writeStream.end();
  process.exit();
}
