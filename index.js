// index.js
const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require("@adiwajshing/baileys");
const { handleMessage } = require("./lib/handler");
const { state, saveState } = useSingleFileAuthState("./session.json");
const { botName } = require("./config");

// Create WhatsApp socket
const startBot = async () => {
  const bot = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  // Listen to messages
  bot.ev.on("messages.upsert", async ({ messages }) => {
    for (let msg of messages) {
      if (!msg.key.fromMe && msg.message) {
        await handleMessage(bot, msg.message);
      }
    }
  });

  // Connection updates
  bot.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const reason = lastDisconnect.error?.output?.statusCode;
      console.log(`[${botName}] Connection closed, reason:`, reason);
      if (reason !== DisconnectReason.loggedOut) startBot();
    } else if (connection === "open") {
      console.log(`[${botName}] Connected successfully!`);
    }
  });

  // Save auth state
  bot.ev.on("creds.update", saveState);
};

startBot();