const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const path = require('path');

async function vv({ sock, msg, config }) {
  const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
  
  if (!quoted) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `Reply to a view-once message with ${config.prefix}vv to download it.`
    }, { quoted: msg });
  }
  
  // Check if it's a view-once message
  const isViewOnce = quoted.imageMessage?.viewOnce || 
                     quoted.videoMessage?.viewOnce ||
                     quoted.audioMessage?.viewOnce;
  
  if (!isViewOnce) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: '❌ This is not a view-once message.'
    }, { quoted: msg });
  }
  
  try {
    await sock.sendMessage(msg.key.remoteJid, {
      text: '⏳ Downloading view-once media...'
    }, { quoted: msg });
    
    // Determine message type
    let messageType, mediaMessage;
    if (quoted.imageMessage) {
      messageType = 'image';
      mediaMessage = quoted.imageMessage;
    } else if (quoted.videoMessage) {
      messageType = 'video';
      mediaMessage = quoted.videoMessage;
    } else if (quoted.audioMessage) {
      messageType = 'audio';
      mediaMessage = quoted.audioMessage;
    }
    
    // Download the media
    const buffer = await downloadMediaMessage(
      {
        key: {
          remoteJid: msg.key.remoteJid,
          id: msg.message.extendedTextMessage.contextInfo.stanzaId,
          participant: msg.message.extendedTextMessage.contextInfo.participant
        },
        message: quoted
      },
      'buffer',
      {},
      {
        logger: console,
        reuploadRequest: sock.updateMediaMessage
      }
    );
    
    if (!buffer) {
      return await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ Failed to download media.'
      }, { quoted: msg });
    }
    
    // Send back without view-once restriction
    const caption = `📥 *View-Once Downloaded*\n\nOriginal sender: @${msg.message.extendedTextMessage.contextInfo.participant.split('@')[0]}\nType: ${messageType.toUpperCase()}\n\n${config.footer}`;
    
    const options = {
      caption,
      mentions: [msg.message.extendedTextMessage.contextInfo.participant]
    };
    
    if (messageType === 'image') {
      await sock.sendMessage(msg.key.remoteJid, { image: buffer, ...options }, { quoted: msg });
    } else if (messageType === 'video') {
      await sock.sendMessage(msg.key.remoteJid, { video: buffer, ...options }, { quoted: msg });
    } else if (messageType === 'audio') {
      await sock.sendMessage(msg.key.remoteJid, { audio: buffer, mimetype: 'audio/mp4', ...options }, { quoted: msg });
    }
    
  } catch (err) {
    console.error('VV Error:', err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: `❌ Error: ${err.message}`
    }, { quoted: msg });
  }
}

module.exports = { vv };
