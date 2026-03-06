// lib/handler.js
const commands = require('../commands/commands.js');

async function handleMessage(bot, msg) {
  try {
    // Ignore messages from the bot itself
    if (msg.fromMe) return;

    const body = msg.body || '';
    if (!body.startsWith('!')) return; // Only commands with "!" prefix

    const [cmd, ...args] = body.slice(1).trim().split(/\s+/);
    const commandFunc = commands[cmd.toLowerCase()];

    if (commandFunc) {
      console.log(`Executing command: ${cmd} from ${msg.from}`);
      await commandFunc(bot, msg, args);
    } else {
      // Unknown command response
      await bot.sendMessage(msg.from, { text: `❌ Unknown command: ${cmd}\nType !menu to see available commands.` });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    await bot.sendMessage(msg.from, { text: '⚠️ Oops! Something went wrong while executing your command.' });
  }
}

module.exports = { handleMessage };