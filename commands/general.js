const { getRandomMenuImage, formatUptime, monospace } = require('../lib/utils');
const { getCommands } = require('../lib/handler');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

let startTime = Date.now();

async function ping({ sock, msg, config }) {
  const latency = Date.now() - startTime;
  const uptime = formatUptime((Date.now() - startTime) / 1000);
  
  const text = `
╭─❮ ${config.botName} ❯
│
│ ⚡ Speed: ${latency}ms
│ ⏱️ Uptime: ${uptime}
│ 📡 Status: Active
│ 👤 Owner: ${config.author}
│
╰─❮ ${config.footer} ❯
  `.trim();
  
  await sock.sendMessage(msg.key.remoteJid, {
    text,
    contextInfo: {
      externalAdReply: {
        title: config.botName,
        body: "Tap to join our channel",
        mediaType: 1,
        thumbnailUrl: "https://raw.githubusercontent.com/WhiskeySockets/Baileys/master/media/baileys-logo.png",
        sourceUrl: config.channelUrl
      }
    }
  }, { quoted: msg });
}

async function menu({ sock, msg, config }) {
  const { commandCategories } = getCommands();
  const imagePath = await getRandomMenuImage();
  
  let menuText = `
╭─❮ ${config.botName} ❯
│ 👤 Owner: ${config.author}
│ 📅 Date: ${new Date().toLocaleDateString()}
│ ⏰ Time: ${new Date().toLocaleTimeString()}
│ 📂 Categories: ${Object.keys(commandCategories).length}
│ ⚙️ Commands: ${Object.values(commandCategories).flat().length}
│ 🔑 Prefix: [ ${config.prefix} ]
╰───────────────────

`;
  
  for (const [category, cmds] of Object.entries(commandCategories)) {
    menuText += `┌──❮ ${category} ❯\n`;
    menuText += `│ ${cmds.map(c => config.prefix + c).join(', ')}\n`;
    menuText += `└──────────────\n\n`;
  }
  
  menuText += `╰─❮ ${config.footer} ❯`;
  
  await sock.sendMessage(msg.key.remoteJid, {
    image: await fs.readFile(imagePath),
    caption: menuText,
    contextInfo: {
      externalAdReply: {
        title: config.botName,
        body: "Tap to join our channel",
        mediaType: 1,
        sourceUrl: config.channelUrl
      }
    }
  }, { quoted: msg });
}

async function help({ sock, msg, args, config }) {
  if (!args[0]) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `Usage: ${config.prefix}help <command>\nExample: ${config.prefix}help ping`
    }, { quoted: msg });
  }
  
  // Simple help - can be expanded
  await sock.sendMessage(msg.key.remoteJid, {
    text: `Command: ${args[0]}\nUse ${config.prefix}menu to see all commands.`
  }, { quoted: msg });
}

async function sticker({ sock, msg, config }) {
  const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted || (!quoted.imageMessage && !quoted.videoMessage)) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `Reply to an image/video with ${config.prefix}sticker`
    }, { quoted: msg });
  }
  
  await sock.sendMessage(msg.key.remoteJid, {
    text: '⏳ Creating sticker...'
  }, { quoted: msg });
  
  // Sticker creation logic here (requires sharp or similar)
  // For now, placeholder
  await sock.sendMessage(msg.key.remoteJid, {
    text: '✅ Sticker feature - add sharp library for image processing'
  }, { quoted: msg });
}

async function toimg({ sock, msg, config }) {
  await sock.sendMessage(msg.key.remoteJid, {
    text: 'Reply to a sticker with this command to convert to image.'
  }, { quoted: msg });
}

async function tourl({ sock, msg, config }) {
  await sock.sendMessage(msg.key.remoteJid, {
    text: 'Upload media to URL feature - requires cloud storage setup.'
  }, { quoted: msg });
}

async function tts({ sock, msg, args, config }) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `Usage: ${config.prefix}tts <text>`
    }, { quoted: msg });
  }
  
  const text = args.join(' ');
  // TTS implementation requires gTTS or similar
  await sock.sendMessage(msg.key.remoteJid, {
    text: `🎙️ TTS: "${text}"\n\n(Feature requires gTTS library)`
  }, { quoted: msg });
}

async function translate({ sock, msg, args, config }) {
  if (args.length < 2) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `Usage: ${config.prefix}translate <lang> <text>\nExample: ${config.prefix}translate es Hello world`
    }, { quoted: msg });
  }
  
  const lang = args[0];
  const text = args.slice(1).join(' ');
  
  await sock.sendMessage(msg.key.remoteJid, {
    text: `Translating to ${lang}: "${text}"\n\n(Feature requires Google Translate API)`
  }, { quoted: msg });
}

async function weather({ sock, msg, args, config }) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `Usage: ${config.prefix}weather <city>`
    }, { quoted: msg });
  }
  
  const city = args.join(' ');
  await sock.sendMessage(msg.key.remoteJid, {
    text: `Weather for ${city}:\n\n(Feature requires OpenWeatherMap API)`
  }, { quoted: msg });
}

async function news({ sock, msg, config }) {
  await sock.sendMessage(msg.key.remoteJid, {
    text: '📰 Latest News:\n\n(Feature requires NewsAPI)'
  }, { quoted: msg });
}

module.exports = {
  ping,
  menu,
  help,
  sticker,
  s: sticker,
  toimg,
  tourl,
  tts,
  translate,
  weather,
  news
};
