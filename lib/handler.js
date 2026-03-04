const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const config = require('../config.json');

// Load all commands
const commands = new Map();
const commandCategories = {};

async function loadCommands() {
  const commandsDir = path.join(__dirname, '..', 'commands');
  const files = await fs.readdir(commandsDir);
  
  for (const file of files) {
    if (file.endsWith('.js')) {
      delete require.cache[require.resolve(path.join(commandsDir, file))];
      const cmdModule = require(path.join(commandsDir, file));
      
      const category = file.replace('.js', '').toUpperCase();
      commandCategories[category] = [];
      
      for (const [cmdName, cmdFunc] of Object.entries(cmdModule)) {
        if (typeof cmdFunc === 'function') {
          commands.set(cmdName.toLowerCase(), cmdFunc);
          commandCategories[category].push(cmdName.toLowerCase());
        }
      }
    }
  }
  
  console.log(chalk.blue(`Loaded ${commands.size} commands from ${files.length} categories`));
}

// Initial load
loadCommands();

async function handleMessages(sock, m, config, store) {
  if (!m.messages) return;
  
  for (const msg of m.messages) {
    if (!msg.message || msg.key.fromMe) continue;
    
    const messageType = Object.keys(msg.message)[0];
    const body = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || 
                 msg.message?.imageMessage?.caption || 
                 msg.message?.videoMessage?.caption || '';
    
    const isCommand = body.startsWith(config.prefix);
    if (!isCommand) continue;
    
    const args = body.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const fullArgs = args.join(' ');
    
    const context = {
      sock,
      msg,
      args,
      fullArgs,
      config,
      store,
      sender: msg.key.participant || msg.key.remoteJid,
      chat: msg.key.remoteJid,
      isGroup: msg.key.remoteJid.endsWith('@g.us'),
      isOwner: (msg.key.participant || msg.key.remoteJid).split('@')[0] === config.ownerNumber
    };
    
    // Get group metadata if in group
    if (context.isGroup) {
      try {
        context.groupMetadata = await sock.groupMetadata(context.chat);
        context.isAdmin = context.groupMetadata.participants.find(p => p.id === context.sender)?.admin !== null;
        context.isBotAdmin = context.groupMetadata.participants.find(p => p.id === sock.user.id)?.admin !== null;
      } catch {}
    }
    
    const cmdFunc = commands.get(command);
    if (cmdFunc) {
      try {
        console.log(chalk.cyan(`[CMD] ${command} from ${context.sender.split('@')[0]}`));
        await cmdFunc(context);
      } catch (err) {
        console.error(chalk.red(`[ERROR] ${command}:`), err);
        await sock.sendMessage(context.chat, { 
          text: `❌ Error executing command\n\n${err.message}` 
        }, { quoted: msg });
      }
    }
  }
}

function getCommands() {
  return { commands, commandCategories };
}

module.exports = { handleMessages, loadCommands, getCommands };
