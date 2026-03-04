async function kick({ sock, msg, args, isGroup, isAdmin, isBotAdmin, config }) {
  if (!isGroup) return await sock.sendMessage(msg.key.remoteJid, { text: 'Group only!' }, { quoted: msg });
  if (!isAdmin) return await sock.sendMessage(msg.key.remoteJid, { text: 'Admin only!' }, { quoted: msg });
  if (!isBotAdmin) return await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be admin!' }, { quoted: msg });
  
  const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mentioned) return await sock.sendMessage(msg.key.remoteJid, { text: 'Tag someone!' }, { quoted: msg });
  
  await sock.groupParticipantsUpdate(msg.key.remoteJid, [mentioned], 'remove');
  await sock.sendMessage(msg.key.remoteJid, { text: '👢 User kicked!' }, { quoted: msg });
}

async function add({ sock, msg, args, isGroup, isAdmin, isBotAdmin, config }) {
  if (!isGroup) return await sock.sendMessage(msg.key.remoteJid, { text: 'Group only!' }, { quoted: msg });
  if (!isAdmin) return await sock.sendMessage(msg.key.remoteJid, { text: 'Admin only!' }, { quoted: msg });
  
  const number = args[0]?.replace(/[^0-9]/g, '');
  if (!number) return await sock.sendMessage(msg.key.remoteJid, { text: 'Provide a number!' }, { quoted: msg });
  
  await sock.groupParticipantsUpdate(msg.key.remoteJid, [`${number}@s.whatsapp.net`], 'add');
  await sock.sendMessage(msg.key.remoteJid, { text: '➕ User added!' }, { quoted: msg });
}

async function promote({ sock, msg, args, isGroup, isAdmin, isBotAdmin, config }) {
  if (!isGroup) return await sock.sendMessage(msg.key.remoteJid, { text: 'Group only!' }, { quoted: msg });
  if (!isAdmin) return await sock.sendMessage(msg.key.remoteJid, { text: 'Admin only!' }, { quoted: msg });
  if (!isBotAdmin) return await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be admin!' }, { quoted: msg });
  
  const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mentioned) return await sock.sendMessage(msg.key.remoteJid, { text: 'Tag someone!' }, { quoted: msg });
  
  await sock.groupParticipantsUpdate(msg.key.remoteJid, [mentioned], 'promote');
  await sock.sendMessage(msg.key.remoteJid, { text: '⬆️ User promoted to admin!' }, { quoted: msg });
}

async function demote({ sock, msg, args, isGroup, isAdmin, isBotAdmin, config }) {
  if (!isGroup) return await sock.sendMessage(msg.key.remoteJid, { text: 'Group only!' }, { quoted: msg });
  if (!isAdmin) return await sock.sendMessage(msg.key.remoteJid, { text: 'Admin only!' }, { quoted: msg });
  if (!isBotAdmin) return await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be admin!' }, { quoted: msg });
  
  const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mentioned) return await sock.sendMessage(msg.key.remoteJid, { text: 'Tag someone!' }, { quoted: msg });
  
  await sock.groupParticipantsUpdate(msg.key.remoteJid, [mentioned], 'demote');
  await sock.sendMessage(msg.key.remoteJid, { text: '⬇️ User demoted!' }, { quoted: msg });
}

async function group({ sock, msg, args, isGroup, isAdmin, isBotAdmin, config }) {
  if (!isGroup) return await sock.sendMessage(msg.key.remoteJid, { text: 'Group only!' }, { quoted: msg });
  if (!isAdmin) return await sock.sendMessage(msg.key.remoteJid, { text: 'Admin only!' }, { quoted: msg });
  if (!isBotAdmin) return await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be admin!' }, { quoted: msg });
  
  const action = args[0]?.toLowerCase();
  if (action === 'close') {
    await sock.groupSettingUpdate(msg.key.remoteJid, 'announcement');
    await sock.sendMessage(msg.key.remoteJid, { text: '🔒 Group closed!' }, { quoted: msg });
  } else if (action === 'open') {
    await sock.groupSettingUpdate(msg.key.remoteJid, 'not_announcement');
    await sock.sendMessage(msg.key.remoteJid, { text: '🔓 Group opened!' }, { quoted: msg });
  } else {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Use: open/close' }, { quoted: msg });
  }
}

async function setdesc({ sock, msg, args, isGroup, isAdmin, isBotAdmin, config }) {
  if (!isGroup) return await sock.sendMessage(msg.key.remoteJid, { text: 'Group only!' }, { quoted: msg });
  if (!isAdmin) return await sock.sendMessage(msg.key.remoteJid, { text: 'Admin only!' }, { quoted: msg });
  
  const desc = args.join(' ');
  if (!desc) return await sock.sendMessage(msg.key.remoteJid, { text: 'Provide description!' }, { quoted: msg });
  
  await sock.groupUpdateDescription(msg.key.remoteJid, desc);
  await sock.sendMessage(msg.key.remoteJid, { text: '✏️ Description updated!' }, { quoted: msg });
}

async function setname({ sock, msg, args, isGroup, isAdmin, isBotAdmin, config }) {
  if (!isGroup) return await sock.sendMessage(msg.key.remoteJid, { text: 'Group only!' }, { quoted: msg });
  if (!isAdmin) return await sock.sendMessage(msg.key.remoteJid, { text: 'Admin only!' }, { quoted: msg });
  
  const name = args.join(' ');
  if (!name) return await sock.sendMessage(msg.key.remoteJid, { text: 'Provide name!' }, { quoted: msg });
  
  await sock.groupUpdateSubject(msg.key.remoteJid, name);
  await sock.sendMessage(msg.key.remoteJid, { text: '✏️ Group name updated!' }, { quoted: msg });
}

async function tagall({ sock, msg, args, isGroup, groupMetadata, config }) {
  if (!isGroup) return await sock.sendMessage(msg.key.remoteJid, { text: 'Group only!' }, { quoted: msg });
  
  const text = args.join(' ') || 'Attention everyone!';
  let mentions = [];
  let teks = `📢 *${text}*\n\n`;
  
  for (let member of groupMetadata.participants) {
    teks += `➤ @${member.id.split('@')[0]}\n`;
    mentions.push(member.id);
  }
  
  await sock.sendMessage(msg.key.remoteJid, { text: teks, mentions }, { quoted: msg });
}

async function hidetag({ sock, msg, args, isGroup, groupMetadata, config }) {
  if (!isGroup) return await sock.sendMessage(msg.key.remoteJid, { text: 'Group only!' }, { quoted: msg });
  
  const text = args.join(' ');
  if (!text) return await sock.sendMessage(msg.key.remoteJid, { text: 'Provide text!' }, { quoted: msg });
  
  let mentions = groupMetadata.participants.map(p => p.id);
  await sock.sendMessage(msg.key.remoteJid, { text, mentions }, { quoted: msg });
}

async function antilink({ sock, msg, args, isGroup, isAdmin, config }) {
  if (!isGroup) return await sock.sendMessage(msg.key.remoteJid, { text: 'Group only!' }, { quoted: msg });
  if (!isAdmin) return await sock.sendMessage(msg.key.remoteJid, { text: 'Admin only!' }, { quoted: msg });
  
  // Store in database - placeholder
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `Antilink ${args[0] === 'on' ? 'enabled' : 'disabled'} (Feature requires database)` 
  }, { quoted: msg });
}

async function antidelete({ sock, msg, args, isGroup, isAdmin, config }) {
  if (!isGroup) return await sock.sendMessage(msg.key.remoteJid, { text: 'Group only!' }, { quoted: msg });
  if (!isAdmin) return await sock.sendMessage(msg.key.remoteJid, { text: 'Admin only!' }, { quoted: msg });
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `Antidelete ${args[0] === 'on' ? 'enabled' : 'disabled'} (Feature requires database)` 
  }, { quoted: msg });
}

async function welcome({ sock, msg, args, isGroup, isAdmin, config }) {
  if (!isGroup) return await sock.sendMessage(msg.key.remoteJid, { text: 'Group only!' }, { quoted: msg });
  if (!isAdmin) return await sock.sendMessage(msg.key.remoteJid, { text: 'Admin only!' }, { quoted: msg });
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `Welcome messages ${args[0] === 'on' ? 'enabled' : 'disabled'} (Feature requires database)` 
  }, { quoted: msg });
}

async function goodbye({ sock, msg, args, isGroup, isAdmin, config }) {
  if (!isGroup) return await sock.sendMessage(msg.key.remoteJid, { text: 'Group only!' }, { quoted: msg });
  if (!isAdmin) return await sock.sendMessage(msg.key.remoteJid, { text: 'Admin only!' }, { quoted: msg });
  
  await sock.sendMessage(msg.key.remoteJid, { 
    text: `Goodbye messages ${args[0] === 'on' ? 'enabled' : 'disabled'} (Feature requires database)` 
  }, { quoted: msg });
}

module.exports = {
  kick,
  add,
  promote,
  demote,
  group,
  setdesc,
  setname,
  tagall,
  hidetag,
  antilink,
  antidelete,
  welcome,
  goodbye
};
