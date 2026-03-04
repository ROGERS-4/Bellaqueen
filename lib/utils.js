const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function fetchJson(url, options = {}) {
  try {
    const res = await axios({
      url,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        ...options.headers
      },
      ...options
    });
    return res.data;
  } catch (err) {
    return { error: err.message };
  }
}

async function fetchBuffer(url, options = {}) {
  try {
    const res = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        ...options.headers
      },
      ...options
    });
    return Buffer.from(res.data);
  } catch (err) {
    return null;
  }
}

async function getRandomMenuImage() {
  const assetsDir = path.join(__dirname, '..', 'assets', 'menu');
  const files = await fs.readdir(assetsDir);
  const images = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  const random = images[Math.floor(Math.random() * images.length)];
  return path.join(assetsDir, random);
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

function monospace(text) {
  return '```' + text + '```';
}

module.exports = {
  fetchJson,
  fetchBuffer,
  getRandomMenuImage,
  formatUptime,
  monospace
};
