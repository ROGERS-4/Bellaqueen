const { spawn } = require('child_process');
const path = require('path');

console.log('Starting QUEEN BELLA V1...');

function startBot() {
  const bot = spawn('node', [path.join(__dirname, 'lib', 'connection.js')], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  bot.on('close', (code) => {
    if (code !== 0) {
      console.log(`Bot crashed with code ${code}. Restarting in 3 seconds...`);
      setTimeout(startBot, 3000);
    } else {
      console.log('Bot stopped normally.');
    }
  });

  bot.on('error', (err) => {
    console.error('Failed to start bot:', err);
    setTimeout(startBot, 5000);
  });
}

startBot();
