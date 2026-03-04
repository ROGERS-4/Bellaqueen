const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  jidDecode,
  proto
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const config = require('../config.json');
const { handleMessages } = require('./handler');
const { initAutoStatus } = require('./autoStatus');

const logger = pino({ level: 'silent' });
const store = makeInMemoryStore({ logger });

async function connectToWhatsApp() {
  const sessionDir = path.join(__dirname, '..', 'session');
  
  // Ensure session directory exists
  await fs.ensureDir(sessionDir);

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(chalk.cyan(`Using Baileys v${version.join('.')}, isLatest: ${isLatest}`));

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false, // Using pairing code
    auth: state,
    browser: ['𝐐𝐔𝐄𝐄𝐍 𝐁𝐄𝐋𝐋𝐀 𝐕𝟏', 'Chrome', '1.0.0'],
    getMessage: async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg?.message || undefined;
      }
      return proto.Message.fromObject({});
    }
  });

  store.bind(sock.ev);
  sock.ev.on('creds.update', saveCreds);

  // Pairing code logic
  if (!sock.authState.creds.registered) {
    console.log(chalk.yellow('\n╔════════════════════════════════════╗'));
    console.log(chalk.yellow('║     𝐐𝐔𝐄𝐄𝐍 𝐁𝐄𝐋𝐋𝐀 𝐕𝟏 PAIRING      ║'));
    console.log(chalk.yellow('╚════════════════════════════════════╝\n'));
    
    const phoneNumber = config.ownerNumber || await askQuestion('Enter your WhatsApp number (with country code): ');
    
    if (!phoneNumber) {
      console.log(chalk.red('Phone number required!'));
      process.exit(1);
    }

    // Update config with owner number
    config.ownerNumber = phoneNumber.replace(/[^0-9]/g, '');
    await fs.writeJson(path.join(__dirname, '..', 'config.json'), config, { spaces: 2 });

    console.log(chalk.blue('Requesting pairing code...'));
    
    try {
      const code = await sock.requestPairingCode(phoneNumber);
      console.log(chalk.green(`\n╔════════════════════════════════════╗`));
      console.log(chalk.green(`║  Your Pairing Code: ${code}      ║`));
      console.log(chalk.green(`╚════════════════════════════════════╝`));
      console.log(chalk.yellow('\nEnter this code in your WhatsApp > Linked Devices > Link with Phone Number\n'));
    } catch (err) {
      console.error(chalk.red('Pairing failed:'), err.message);
      process.exit(1);
    }
  }

  // Connection update handler
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(chalk.red('Connection closed due to:'), lastDisconnect?.error?.message);
      
      if (shouldReconnect) {
        console.log(chalk.yellow('Reconnecting...'));
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log(chalk.green('\n╔════════════════════════════════════╗'));
      console.log(chalk.green('║   𝐐𝐔𝐄𝐄𝐍 𝐁𝐄𝐋𝐋𝐀 𝐕𝟏 CONNECTED     ║'));
      console.log(chalk.green('║       Developed by Rodgers         ║'));
      console.log(chalk.green('╚════════════════════════════════════╝\n'));
      
      // Send session to owner
      await sendSessionToOwner(sock);
      
      // Initialize auto status features
      initAutoStatus(sock, config);
    }
  });

  // Message handler
  sock.ev.on('messages.upsert', async (m) => {
    await handleMessages(sock, m, config, store);
  });

  // Presence update for auto-read
  if (config.settings.autoread) {
    sock.ev.on('presence.update', async (json) => {
      if (json.presences[json.id]?.lastKnownPresence === 'composing') {
        await sock.readMessages([json.id]);
      }
    });
  }

  return sock;
}

async function sendSessionToOwner(sock) {
  try {
    const sessionDir = path.join(__dirname, '..', 'session');
    const credsPath = path.join(sessionDir, 'creds.json');
    
    if (await fs.pathExists(credsPath)) {
      const creds = await fs.readJson(credsPath);
      const sessionData = JSON.stringify(creds, null, 2);
      
      await sock.sendMessage(config.ownerNumber + '@s.whatsapp.net', {
        document: Buffer.from(sessionData),
        fileName: 'creds.json',
        mimetype: 'application/json',
        caption: `𝐐𝐔𝐄𝐄𝐍 𝐁𝐄𝐋𝐋𝐀 𝐕𝟏 Session\n\nSave this file and use it for deployment.\n\n${config.footer}`
      });
      
      console.log(chalk.green('Session sent to owner'));
    }
  } catch (err) {
    console.error(chalk.red('Failed to send session:'), err.message);
  }
}

function askQuestion(query) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

connectToWhatsApp().catch(err => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});
