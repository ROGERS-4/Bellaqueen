const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

async function restart({ sock, msg, isOwner, config }) {
  if (!isOwner) return await sock.sendMessage(msg.key.remoteJid, { text: 'Owner only!' }, { quoted: msg });
  
  await sock.sendMessage(msg.key.remoteJid, { text: '🔄 Restarting...' }, { quoted: msg });
  process.exit(0); // Auto-restart will handle it
}

async function shutdown({ sock, msg, isOwner, config }) {
  if (!isOwner) return await sock.sendMessage(msg.key.remoteJid, { text: 'Owner only!' }, { quoted: msg });
  
  await sock.sendMessage(msg.key.remoteJid, { text: '👋 Shutting down...' }, { quoted: msg });
  process.exit(1); // Won't restart
}

async function broadcast({ sock, msg, args, isOwner, config, store }) {
  if (!isOwner) return await sock.sendMessage(msg.key.remoteJid, { text: 'Owner only!' }, { quoted: msg });
  
  const text = args.join(' ');
  if (!text) return await sock.sendMessage(msg.key.remoteJid, { text: 'Provide message!' }, { quoted: msg });
  
  const chats = Object.keys(store.chats).filter(jid => !jid.includes('@broadcast'));
  let sent = 0;
  
  for (const chat of chats) {
    try {
      await sock.sendMessage(chat, { text: `📢 *Broadcast*\n\n${text}\n\n${config.footer}` });
      sent++;
    } catch {}
  }
  
  await sock.sendMessage(msg.key.remoteJid, { text: `✅ Broadcast sent to ${sent} chats` }, { quoted: msg });
}

async function setpp({ sock, msg, isOwner, config }) {
  if (!isOwner) return await sock.sendMessage(msg.key.remoteJid, { text: 'Owner only!' }, { quoted: msg });
  
  const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted?.imageMessage) {
    return await sock.sendMessage(msg.key.remoteJid, { text: 'Reply to an image!' }, { quoted: msg });
  }
  
  await sock.sendMessage(msg.key.remoteJid, { text: '⏳ Updating profile picture...' }, { quoted: msg });
  // Implementation requires downloading and updating PP
}

async function setname({ sock, msg, args, isOwner, config }) {
  if (!isOwner) return await sock.sendMessage(msg.key.remoteJid, { text: 'Owner only!' }, { quoted: msg });
  
  const name = args.join(' ');
  if (!name) return await sock.sendMessage(msg.key.remoteJid, { text: 'Provide name!' }, { quoted: msg });
  
  await sock.updateProfileName(name);
  await sock.sendMessage(msg.key.remoteJid, { text: '✅ Name updated!' }, { quoted: msg });
}

async function setbio({ sock, msg, args, isOwner, config }) {
  if (!isOwner) return await sock.sendMessage(msg.key.remoteJid, { text: 'Owner only!' }, { quoted: msg });
  
  const bio = args.join(' ');
  if (!bio) return await sock.sendMessage(msg.key.remoteJid, { text: 'Provide bio!' }, { quoted: msg });
  
  await sock.updateProfileStatus(bio);
  await sock.sendMessage(msg.key.remoteJid, { text: '✅ Bio updated!' }, { quoted: msg });
}

async function block({ sock, msg, args, isOwner, config }) {
  if (!isOwner) return await sock.sendMessage(msg.key.remoteJid, { text: 'Owner only!' }, { quoted: msg });
  
  const number = args[0]?.replace(/[^0-9]/g, '');
  if (!number) return await sock.sendMessage(msg.key.remoteJid, { text: 'Provide number!' }, { quoted: msg });
  
  await sock.updateBlockStatus(`${number}@s.whatsapp.net`, 'block');
  await sock.sendMessage(msg.key.remoteJid, { text: `🚫 Blocked ${number}` }, { quoted: msg });
}

async function unblock({ sock, msg, args, isOwner, config }) {
  if (!isOwner) return await sock.sendMessage(msg.key.remoteJid, { text: 'Owner only!' }, { quoted: msg });
  
  const number = args[0]?.replace(/[^0-9]/g, '');
  if (!number) return await sock.sendMessage(msg.key.remoteJid, { text: 'Provide number!' }, { quoted: msg });
  
  await sock.updateBlockStatus(`${number}@s.whatsapp.net`, 'unblock');
  await sock.sendMessage(msg.key.remoteJid, { text: `✅ Unblocked ${number}` }, { quoted: msg });
}

async function clearchats({ sock, msg, isOwner, config }) {
  if (!isOwner) return await sock.sendMessage(msg.key.remoteJid, { text: 'Owner only!' }, { quoted: msg });
  
  const chats = await sock.chats;
  for (const [jid] of Object.entries(chats)) {
    await sock.chatModify({ delete: true, lastMessages: [] }, jid);
  }
  
  await sock.sendMessage(msg.key.remoteJid, { text: '🗑️ All chats cleared!' }, { quoted: msg });
}

// Notes system (JSON based)
const notesFile = path.join(__dirname, '..', 'database', 'notes.json');

async function save({ sock, msg, args, isOwner, config }) {
  if (!isOwner) return await sock.sendMessage(msg.key.remoteJid, { text: 'Owner only!' }, { quoted: msg });
  
  const [name, ...contentArr] = args;
  if (!name || !contentArr.length) {
    return await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: .save <name> <content>' }, { quoted: msg });
  }
  
  const notes = await fs.readJson(notesFile).catch(() => ({}));
  notes[name] = contentArr.join(' ');
  await fs.writeJson(notesFile, notes);
  
  await sock.sendMessage(msg.key.remoteJid, { text: `💾 Note "${name}" saved!` }, { quoted: msg });
}

async function get({ sock, msg, args, isOwner, config }) {
  if (!isOwner) return await sock.sendMessage(msg.key.remoteJid, { text: 'Owner only!' }, { quoted: msg });
  
  const name = args[0];
  if (!name) return await sock.sendMessage(msg.key.remoteJid, { text: 'Provide note name!' }, { quoted: msg });
  
  const notes = await fs.readJson(notesFile).catch(() => ({}));
  const content = notes[name];
  
  if (!content) {
    return await sock.sendMessage(msg.key.remoteJid, { text: 'Note not found!' }, { quoted: msg });
  }
  
  await sock.sendMessage(msg.key.remoteJid, { text: `📝 *${name}*\n\n${content}` }, { quoted: msg });
}

async function delnote({ sock, msg, args, isOwner, config }) {
  if (!isOwner) return await sock.sendMessage(msg.key.remoteJid, { text: 'Owner only!' }, { quoted: msg });
  
  const name = args[0];
  if (!name) return await sock.sendMessage(msg.key.remoteJid, { text: 'Provide note name!' }, { quoted: msg });
  
  const notes = await fs.readJson(notesFile).catch(() => ({}));
  delete notes[name];
  await fs.writeJson(notesFile, notes);
  
  await sock.sendMessage(msg.key.remoteJid, { text: `🗑️ Note "${name}" deleted!` }, { quoted: msg });
}

module.exports = {
  restart,
  shutdown,
  broadcast,
  setpp,
  setname,
  setbio,
  block,
  unblock,
  clearchats,
  save,
  get,
  delnote
};
