// commands.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const menuImage = fs.readFileSync(path.join(__dirname, '../media/menu.jpg')); // hardcoded menu image

module.exports = {
  // ==================== MENU ====================
  menu: async (bot, msg) => {
    await bot.sendMessage(msg.from, {
      image: menuImage,
      caption: `
👑 QUEEN BELLA BOT MENU 👑

🧠 AI Commands:
!ai <question>
!gpt4 <question>
!gptmini <question>
!letmegpt <question>
!deepimg <prompt>
!magicstudio <prompt>
!veo3 <prompt>

🎵 Viral / Media Commands:
!vv <text>
!vv2 <text>
!autoview
!react <emoji>
!sticker <reply image>
!toimg <reply sticker>

💰 Money / Premium:
!balance
!pay <amount>
!buy <item>
!premium

⚙️ Group Admin:
!welcome
!goodbye
!antilink
!antidelete
!mute / !unmute
!promote / !demote
!kick
!tagall / !hidetag

🛠 Tools / Fun:
!shortlink <url>
!adlink <url>
!joke
!advice
!quote

📌 Type commands with ! prefix
      `
    });
  },

  // ==================== AI ====================
  ai: async (bot, msg, args) => {
    const q = encodeURIComponent(args.join(' '));
    const url = `https://api.giftedtech.co.ke/api/ai/ai?apikey=gifted&q=${q}`;
    try { const res = await axios.get(url); await bot.sendMessage(msg.from, { text: res.data.answer || 'No response' }); } 
    catch { await bot.sendMessage(msg.from, { text: 'AI Error 😢' }); }
  },

  gpt4: async (bot, msg, args) => {
    const q = encodeURIComponent(args.join(' '));
    const url = `https://api.giftedtech.co.ke/api/ai/gpt4o?apikey=gifted&q=${q}`;
    try { const res = await axios.get(url); await bot.sendMessage(msg.from, { text: res.data.answer || 'No response' }); } 
    catch { await bot.sendMessage(msg.from, { text: 'GPT4 Error 😢' }); }
  },

  gptmini: async (bot, msg, args) => {
    const q = encodeURIComponent(args.join(' '));
    const url = `https://api.giftedtech.co.ke/api/ai/gpt4o-mini?apikey=gifted&q=${q}`;
    try { const res = await axios.get(url); await bot.sendMessage(msg.from, { text: res.data.answer || 'No response' }); } 
    catch { await bot.sendMessage(msg.from, { text: 'GPT Mini Error 😢' }); }
  },

  letmegpt: async (bot, msg, args) => {
    const q = encodeURIComponent(args.join(' '));
    const url = `https://api.giftedtech.co.ke/api/ai/letmegpt?apikey=gifted&q=${q}`;
    try { const res = await axios.get(url); await bot.sendMessage(msg.from, { text: res.data.answer || 'No response' }); } 
    catch { await bot.sendMessage(msg.from, { text: 'LetMeGPT Error 😢' }); }
  },

  deepimg: async (bot, msg, args) => {
    const prompt = encodeURIComponent(args.join(' '));
    const url = `https://api.giftedtech.co.ke/api/ai/deepimg?apikey=gifted&prompt=${prompt}`;
    try { const res = await axios.get(url); await bot.sendMessage(msg.from, { text: res.data.url || 'No image generated' }); } 
    catch { await bot.sendMessage(msg.from, { text: 'DeepImg Error 😢' }); }
  },

  magicstudio: async (bot, msg, args) => {
    const prompt = encodeURIComponent(args.join(' '));
    const url = `https://api.giftedtech.co.ke/api/ai/magicstudio?apikey=gifted&prompt=${prompt}`;
    try { const res = await axios.get(url); await bot.sendMessage(msg.from, { text: res.data.url || 'No image generated' }); } 
    catch { await bot.sendMessage(msg.from, { text: 'MagicStudio Error 😢' }); }
  },

  veo3: async (bot, msg, args) => {
    const prompt = encodeURIComponent(args.join(' '));
    const url = `https://api.giftedtech.co.ke/api/ai/veo3?apikey=gifted&prompt=${prompt}`;
    try { const res = await axios.get(url); await bot.sendMessage(msg.from, { text: res.data.url || 'No image generated' }); } 
    catch { await bot.sendMessage(msg.from, { text: 'Veo3 Error 😢' }); }
  },

  // ==================== VIRAL / FUN ====================
  vv: async (bot, msg, args) => await bot.sendMessage(msg.from, { text: `VV received: ${args.join(' ')}` }),
  vv2: async (bot, msg, args) => await bot.sendMessage(msg.from, { text: `VV2 received: ${args.join(' ')}` }),
  autoview: async (bot, msg) => await bot.sendMessage(msg.from, { text: 'Autoview activated ✅' }),
  react: async (bot, msg, args) => await bot.sendReaction(msg.chatId, msg.id, args[0] || '👍'),
  sticker: async (bot, msg) => await bot.sendMessage(msg.from, { text: 'Sticker command executed (stub)' }),
  toimg: async (bot, msg) => await bot.sendMessage(msg.from, { text: 'Converted sticker to image (stub)' }),
  
  // ==================== MONEY ====================
  balance: async (bot, msg) => await bot.sendMessage(msg.from, { text: 'Balance: $0.00 💸' }),
  pay: async (bot, msg, args) => await bot.sendMessage(msg.from, { text: `Paid $${args[0] || 0} 💰` }),
  buy: async (bot, msg, args) => await bot.sendMessage(msg.from, { text: `Bought: ${args.join(' ')} ✅` }),
  premium: async (bot, msg) => await bot.sendMessage(msg.from, { text: 'You are now premium 🏆' }),

  // ==================== TOOLS / SHORTENERS ====================
  shortlink: async (bot, msg, args) => {
    const url = encodeURIComponent(args[0]);
    try { const res = await axios.get(`https://api.giftedtech.co.ke/api/tools/tinyurl?apikey=gifted&url=${url}`); await bot.sendMessage(msg.from, { text: res.data.shortened || 'No link' }); } 
    catch { await bot.sendMessage(msg.from, { text: 'Shortlink Error 😢' }); }
  },

  adlink: async (bot, msg, args) => {
    const url = encodeURIComponent(args[0]);
    try { const res = await axios.get(`https://api.giftedtech.co.ke/api/tools/adfoc?apikey=gifted&url=${url}`); await bot.sendMessage(msg.from, { text: res.data.shortened || 'No link' }); } 
    catch { await bot.sendMessage(msg.from, { text: 'AdLink Error 😢' }); }
  },

  joke: async (bot, msg) => { const res = await axios.get('https://api.giftedtech.co.ke/api/fun/jokes?apikey=gifted'); await bot.sendMessage(msg.from, { text: res.data.joke || 'No joke' }); },
  advice: async (bot, msg) => { const res = await axios.get('https://api.giftedtech.co.ke/api/fun/advice?apikey=gifted'); await bot.sendMessage(msg.from, { text: res.data.advice || 'No advice' }); },
  quote: async (bot, msg) => { const res = await axios.get('https://api.giftedtech.co.ke/api/fun/quotes?apikey=gifted'); await bot.sendMessage(msg.from, { text: res.data.quote || 'No quote' }); },

  // ==================== STALKER / SEARCH / ANIME ====================
  gitstalk: async (bot, msg, args) => { const username = args[0]; const res = await axios.get(`https://api.giftedtech.co.ke/api/stalk/gitstalk?apikey=gifted&username=${username}`); await bot.sendMessage(msg.from, { text: JSON.stringify(res.data) }); },
  tiktokstalk: async (bot, msg, args) => { const username = args[0]; const res = await axios.get(`https://api.giftedtech.co.ke/api/stalk/tiktokstalk?apikey=gifted&username=${username}`); await bot.sendMessage(msg.from, { text: JSON.stringify(res.data) }); },
  neko: async (bot, msg) => { const res = await axios.get('https://api.giftedtech.co.ke/api/anime/neko?apikey=gifted'); await bot.sendMessage(msg.from, { text: res.data.url }); },
  waifu: async (bot, msg) => { const res = await axios.get('https://api.giftedtech.co.ke/api/anime/waifu?apikey=gifted'); await bot.sendMessage(msg.from, { text: res.data.url }); },

  // ==================== DOWNLOADERS / EPHOTO360 ====================
  ytmp3: async (bot, msg, args) => { const url = encodeURIComponent(args[0]); const res = await axios.get(`https://api.giftedtech.co.ke/api/download/ytmp3?apikey=gifted&url=${url}&quality=128kbps`); await bot.sendMessage(msg.from, { text: res.data.url }); },
  ytmp4: async (bot, msg, args) => { const url = encodeURIComponent(args[0]); const res = await axios.get(`https://api.giftedtech.co.ke/api/download/ytmp4?apikey=gifted&url=${url}&quality=720p`); await bot.sendMessage(msg.from, { text: res.data.url }); },

  hackerAvatar: async (bot, msg, args) => { const text = encodeURIComponent(args.join(' ')); const res = await axios.get(`https://api.giftedtech.co.ke/api/ephoto360/hackerAvatar?apikey=gifted&text=${text}&style=1`); await bot.sendMessage(msg.from, { text: res.data.url }); },
  glossysilver: async (bot, msg, args) => { const text = encodeURIComponent(args.join(' ')); const res = await axios.get(`https://api.giftedtech.co.ke/api/ephoto360/glossysilver?apikey=gifted&text=${text}`); await bot.sendMessage(msg.from, { text: res.data.url }); }
  
  // You can continue to add the remaining gifted APIs in the same pattern...
};