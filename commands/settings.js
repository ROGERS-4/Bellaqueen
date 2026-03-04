const fs = require('fs-extra');
const path = require('path');

async function setprefix({ sock, msg, args, config, isOwner }) {
  if (!isOwner) return await sock.sendMessage(msg.key.remoteJid, { text: 'Owner only!' }, { quoted: msg });
  
  const newPrefix = args[0];
  if (!newPrefix) return await sock.sendMessage(msg.key.remoteJid, { text: 'Provide a prefix!' }, { quoted: msg });
  
  config.prefix = newPrefix;
  await fs.writeJson(path.join(__dirname, '..', 'config.json'), config, { spaces: 2 });
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `✅ Prefix changed to: ${newPrefix}` 
  }, { quoted: msg });
}

async function autoviewstatus({ sock, msg, args, config, isOwner }) {
  if (!isOwner) return await sock.sendMessage(msg.key.remoteJid, { text: 'Owner only!' }, { quoted: msg });
  
  const status = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(status)) {
    return await sock.sendMessage(msg.key.remoteJid, { text: 'Use: on/off' }, { quoted: msg });
  }
  
  config.settings.autoviewstatus = status === 'on';
  await fs.writeJson(path.join(__dirname, '..', 'config.json'), config, { spaces: 2 });
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `👁️ Auto-view status: ${status.toUpperCase()}` 
  }, { quoted: msg });
}

async function autoreactstatus({ sock, msg, args, config, isOwner }) {
  if (!isOwner) return await sock.sendMessage(msg.key.remoteJid, { text: 'Owner only!' }, { quoted: msg });
  
  const status = args[0]?.toLowerCase();
  if (!['on', 'off'].includes(status)) {
    return await sock.sendMessage(msg.key.remoteJid, { text: 'Use: on/off' }, { quoted: msg });
  }
  
  config.settings.autoreactstatus = status === 'on';
  await fs.writeJson(path.join(__dirname, '..', 'config.json'), config, { spaces: 2 });
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `❤️ Auto-react status: ${status.toUpperCase()}` 
  }, { quoted: msg });
}

async function setreactemoji({ sock, msg, args, config, isOwner }) {
  if (!isOwner) return await sock.sendMessage(msg.key.remoteJid, { text: 'Owner only!' }, { quoted: msg });
  
  const emoji = args[0];
  if (!emoji) return await sock.sendMessage(msg.key.remoteJid, { text: 'Provide an emoji!' }, { quoted: msg });
  
  config.settings.reactEmoji = emoji;
  await fs.writeJson(path.join(__dirname, '..', 'config.json'), config, { spaces: 2 });
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `Emoji set to: ${emoji}` 
  }, { quoted: msg });
}

async function settings({ sock, msg, config }) {
  const s = config.settings;
  const text = `
╭─❮ ${config.botName} SETTINGS ❯
│
│ 🔑 Prefix: ${config.prefix}
│ 👤 Owner: ${config.ownerNumber}
│
│ ⚙️ Auto-View Status: ${s.autoviewstatus ? 'ON' : 'OFF'}
│ ⚙️ Auto-React Status: ${s.autoreactstatus ? 'ON' : 'OFF'}
│ ⚙️ React Emoji: ${s.reactEmoji}
│ ⚙️ Anti-Call: ${s.anticall ? 'ON' : 'OFF'}
│ ⚙️ Auto-Read: ${s.autoread ? 'ON' : 'OFF'}
│
╰─❮ ${config.footer} ❯
  `.trim();
  
  await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
}

module.exports = {
  setprefix,
  autoviewstatus,
  autoreactstatus,
  setreactemoji,
  settings
};
