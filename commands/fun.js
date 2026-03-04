const jokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "Why did the scarecrow win an award? He was outstanding in his field!",
  "Why don't eggs tell jokes? They'd crack each other up!",
  "What do you call a fake noodle? An impasta!",
  "Why did the math book look sad? Because it had too many problems."
];

const quotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Innovation distinguishes between a leader and a follower. - Steve Jobs",
  "Stay hungry, stay foolish. - Steve Jobs",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt"
];

const facts = [
  "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible.",
  "Octopuses have three hearts, nine brains, and blue blood.",
  "Bananas are berries, but strawberries aren't.",
  "A day on Venus is longer than its year."
];

async function joke({ sock, msg, config }) {
  const random = jokes[Math.floor(Math.random() * jokes.length)];
  await sock.sendMessage(msg.key.remoteJid, {
    text: `😂 *Joke*\n\n${random}\n\n${config.footer}`
  }, { quoted: msg });
}

async function quote({ sock, msg, config }) {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  await sock.sendMessage(msg.key.remoteJid, {
    text: `💭 *Quote*\n\n${random}\n\n${config.footer}`
  }, { quoted: msg });
}

async function fact({ sock, msg, config }) {
  const random = facts[Math.floor(Math.random() * facts.length)];
  await sock.sendMessage(msg.key.remoteJid, {
    text: `🤯 *Fact*\n\n${random}\n\n${config.footer}`
  }, { quoted: msg });
}

async function meme({ sock, msg, config }) {
  await sock.sendMessage(msg.key.remoteJid, {
    text: '🎭 Fetching meme...\n\n(Requires meme API like reddit)'
  }, { quoted: msg });
}

async function eightball({ sock, msg, args, config }) {
  if (!args.length) {
    return await sock.sendMessage(msg.key.remoteJid, {
      text: `Ask a question! Usage: ${config.prefix}8ball Will I be rich?`
    }, { quoted: msg });
  }
  
  const responses = [
    "Yes", "No", "Maybe", "Definitely", "Ask again later",
    "Most likely", "Don't count on it", "Outlook good", "Very doubtful"
  ];
  
  const answer = responses[Math.floor(Math.random() * responses.length)];
  await sock.sendMessage(msg.key.remoteJid, {
    text: `🎱 *8-Ball*\n\nQ: ${args.join(' ')}\nA: ${answer}\n\n${config.footer}`
  }, { quoted: msg });
}

module.exports = {
  joke,
  quote,
  fact,
  meme,
  '8ball': eightball
};
