const config = require('../config.json');

function initAutoStatus(sock, config) {
  sock.ev.on('messages.upsert', async (m) => {
    if (!m.messages) return;
    
    for (const msg of m.messages) {
      // Check if it's a status
      if (msg.key.remoteJid === 'status@broadcast') {
        const settings = config.settings;
        
        // Auto view status
        if (settings.autoviewstatus) {
          await sock.readMessages([msg.key]);
          console.log(`[STATUS] Viewed status from ${msg.key.participant}`);
        }
        
        // Auto react status
        if (settings.autoreactstatus && settings.reactEmoji) {
          try {
            await sock.sendMessage(msg.key.remoteJid, {
              react: {
                text: settings.reactEmoji,
                key: msg.key
              }
            });
            console.log(`[STATUS] Reacted ${settings.reactEmoji} to ${msg.key.participant}`);
          } catch (err) {
            console.error('[STATUS REACT ERROR]', err);
          }
        }
      }
    }
  });
}

module.exports = { initAutoStatus };
