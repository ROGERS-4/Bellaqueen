const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
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

// Check for session in env var first
const sessionDir = path.join(__dirname, '..', 'session');

async function connectToWhatsApp() {
  await fs.ensureDir(sessionDir);

  let state, saveCreds;

  // Check if session exists in env var
  if (process.env.SESSION_DATA) {
    console.log(chalk.yellow('Using session from environment variable...'));
    const creds = JSON.parse(process.env.SESSION_DATA);
    await fs.writeJson(path.join(sessionDir, 'creds.json'), creds);
    const auth = await useMultiFileAuthState(sessionDir);
    state = auth.state;
    saveCreds = auth.saveCreds;
  } else {
    const auth = await useMultiFileAuthState(sessionDir);
    state = auth.state;
    saveCreds = auth.saveCreds;
  }

  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(chalk.cyan(`Using Baileys v${version.join('.')}`));

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: state,
    browser: ['Queen Bella V1', 'Chrome', '1.0.0'],
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

  // Pairing code logic - only if not registered
  if (!sock.authState.creds.registered) {
    console.log(chalk.yellow('\n╔════════════════════════════════════╗'));
    console.log(chalk.yellow('║     QUEEN BELLA V1 PAIRING         ║'));
    console.log(chalk.yellow('╚════════════════════════════════════╝\n'));
    
    const phoneNumber = await askQuestion('Enter your WhatsApp number (with country code, e.g., 2547XXXXXXXX): ');
    
    if (!phoneNumber || phoneNumber.length < 10) {
      console.log(chalk.red('Invalid phone number!'));
      process.exit(1);
    }

    // Update config
    config.ownerNumber = phoneNumber.replace(/[^0-9]/g, '');
    await fs.writeJson(path.join(__dirname, '..', 'config.json'), config, { spaces: 2 });

    console.log(chalk.blue('Requesting pairing code...'));
    
    try {
      // Wait a bit for socket to be ready
      await delay(2000);
      
      const code = await sock.requestPairingCode(phoneNumber);
      console.log(chalk.green(`\n╔════════════════════════════════════╗`));
      console.log(chalk.green(`║  Your Pairing Code: ${code}       ║`));
      console.log(chalk.green(`╚════════════════════════════════════╝`));
      console.log(chalk.yellow('\nEnter this code in WhatsApp → Settings → Linked Devices → Link with Phone Number\n'));
    } catch (err) {
      console.error(chalk.red('Pairing failed:'), err.message);
      process.exit(1);
    }
  }

  // Connection update handler
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(chalk.red('Connection closed due to:'), lastDisconnect?.error?.message);
      
      if (shouldReconnect) {
        console.log(chalk.yellow('Reconnecting...'));
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log(chalk.green('\n╔════════════════════════════════════╗'));
      console.log(chalk.green('║   QUEEN BELLA V1 CONNECTED         ║'));
      console.log(chalk.green('║       Developed by Rodgers         ║'));
      console.log(chalk.green('╚════════════════════════════════════╝\n'));
      
      // Send session to owner
      await sendSessionToOwner(sock);
      
      // Initialize auto status
      initAutoStatus(sock, config);
    }
  });

  // Message handler
  sock.ev.on('messages.upsert', async (m) => {
    await handleMessages(sock, m, config, store);
  });

  return sock;
}

async function sendSessionToOwner(sock) {
  try {
    const credsPath = path.join(sessionDir, 'creds.json');
    if (await fs.pathExists(credsPath)) {
      const creds = await fs.readJson(credsPath);
      const sessionData = JSON.stringify(creds, null, 2);
      
      await sock.sendMessage(config.ownerNumber + '@s.whatsapp.net', {
        document: Buffer.from(sessionData),
        fileName: 'creds.json',
        mimetype: 'application/json',
        caption: `QUEEN BELLA V1 Session\n\nSave this file and use it for deployment.\n\n${config.footer}`
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
      resolve(answer.trim());
    });
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

connectToWhatsApp().catch(err => {
  console.error(chalk.red('Fatal error:'), err);
  process.exit(1);
});

module.exports = { connectToWhatsApp };
