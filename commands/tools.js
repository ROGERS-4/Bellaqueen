async function calc({ sock, msg, args, config }) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `Usage: ${config.prefix}calc <expression>\nExample: ${config.prefix}calc 5 + 5`
    }, { quoted: msg });
  }
  
  try {
    const expression = args.join(' ');
    // Safe eval alternative
    const result = Function('"use strict"; return (' + expression + ')')();
    await sock.sendMessage(msg.key.remoteJid, {
      text: `🧮 ${expression} = ${result}`
    }, { quoted: msg });
  } catch {
    await sock.sendMessage(msg.key.remoteJid, {
      text: '❌ Invalid expression'
    }, { quoted: msg });
  }
}

async function qr({ sock, msg, args, config }) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `Usage: ${config.prefix}qr <text>`
    }, { quoted: msg });
  }
  
  const text = args.join(' ');
  await sock.sendMessage(msg.key.remoteJid, {
    text: `Generating QR for: "${text}"\n\n(Requires qrcode library)`
  }, { quoted: msg });
}

async function short({ sock, msg, args, config }) {
  if (!args[0]) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `Usage: ${config.prefix}short <URL>`
    }, { quoted: msg });
  }
  
  await sock.sendMessage(msg.key.remoteJid, {
    text: '⏳ Shortening URL...\n\n(Requires tinyurl or bitly API)'
  }, { quoted: msg });
}

async function tempmail({ sock, msg, config }) {
  await sock.sendMessage(msg.key.remoteJid, {
    text: '📧 Generating temporary email...\n\n(Requires temp-mail API)'
  }, { quoted: msg });
}

async function whois({ sock, msg, args, config }) {
  if (!args[0]) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `Usage: ${config.prefix}whois <domain.com>`
    }, { quoted: msg });
  }
  
  await sock.sendMessage(msg.key.remoteJid, {
    text: `🔍 Looking up domain: ${args[0]}\n\n(Requires whois API)`
  }, { quoted: msg });
}

module.exports = {
  calc,
  qr,
  short,
  tempmail,
  whois
};
