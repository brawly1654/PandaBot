import fetch from 'node-fetch';
import axios from 'axios';

export const command = 'ytmp4';

const MAX_FILE_SIZE = 280 * 1024 * 1024;
const VIDEO_THRESHOLD = 70 * 1024 * 1024;
const HEAVY_FILE_THRESHOLD = 100 * 1024 * 1024;
const REQUEST_LIMIT = 3;
const REQUEST_WINDOW_MS = 10000;
const COOLDOWN_MS = 120000;

const requestTimestamps = [];
let isCooldown = false;
let isProcessingHeavy = false;

function isValidYouTubeUrl(url) {
  return /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(url);
}

function formatSize(bytes) {
  if (!bytes || isNaN(bytes)) return 'Desconocido';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

async function getSize(url) {
  try {
    const res = await axios.head(url, { timeout: 10000 });
    const size = parseInt(res.headers['content-length'], 10);
    if (!size) throw new Error('Tamaño no disponible');
    return size;
  } catch {
    throw new Error('No se pudo obtener el tamaño del archivo');
  }
}

async function ytdl(url) {
  const headers = {
    accept: '*/*',
    'accept-language': 'en-US,en;q=0.9',
    'sec-fetch-mode': 'cors',
    referer: 'https://id.ytmp3.mobi/',
  };

  const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?/]+)/)?.[1];
  if (!videoId) throw new Error('ID de video no encontrado');

  const init = await (await fetch(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Date.now()}`, { headers })).json();
  const convert = await (await fetch(`${init.convertURL}&v=${videoId}&f=mp4&_=${Date.now()}`, { headers })).json();

  let info;
  for (let i = 0; i < 3; i++) {
    const res = await fetch(convert.progressURL, { headers });
    info = await res.json();
    if (info.progress === 3) break;
    await new Promise(r => setTimeout(r, 1000));
  }

  if (!info || !convert.downloadURL) throw new Error('No se pudo obtener la URL de descarga');

  return { url: convert.downloadURL, title: info.title || 'Video sin título' };
}

function checkRequestLimit() {
  const now = Date.now();
  requestTimestamps.push(now);
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] > REQUEST_WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= REQUEST_LIMIT) {
    isCooldown = true;
    setTimeout(() => {
      isCooldown = false;
      requestTimestamps.length = 0;
    }, COOLDOWN_MS);
    return false;
  }
  return true;
}

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const url = args[0];

  if (!url || !isValidYouTubeUrl(url)) {
    await sock.sendMessage(from, { text: '❌ Enlace de YouTube inválido o no proporcionado.' }, { quoted: msg });
    return;
  }

  if (isCooldown || !checkRequestLimit()) {
    await sock.sendMessage(from, { text: '⏳ Muchas solicitudes. Espera 2 minutos antes de intentar nuevamente.' }, { quoted: msg });
    return;
  }

  if (isProcessingHeavy) {
    await sock.sendMessage(from, { text: '⚠️ Ya estoy procesando otro archivo pesado. Intenta más tarde.' }, { quoted: msg });
    return;
  }

  await sock.sendMessage(from, { text: '🔄 Procesando video, espera un momento...' }, { quoted: msg });

  try {
    const { url: downloadUrl, title } = await ytdl(url);
    const size = await getSize(downloadUrl);

    if (size > MAX_FILE_SIZE) {
      throw new Error('📦 El archivo supera el límite de 280 MB');
    }

    if (size > HEAVY_FILE_THRESHOLD) {
      isProcessingHeavy = true;
      await sock.sendMessage(from, { text: '📥 Descargando archivo grande, por favor espera...' }, { quoted: msg });
    }

    const caption = `
🎬 *Descarga de Video - MP4*
📌 *Título:* ${title}
📦 *Tamaño:* ${formatSize(size)}
🔗 *Enlace:* ${url}
    `.trim();

    const buffer = await fetch(downloadUrl).then(res => res.buffer());

    await sock.sendMessage(from, {
      video: buffer,
      mimetype: 'video/mp4',
      fileName: `${title}.mp4`,
      caption,
    }, { quoted: msg });

    isProcessingHeavy = false;
  } catch (e) {
    isProcessingHeavy = false;
    await sock.sendMessage(from, { text: `❌ Ocurrió un error: ${e.message}` }, { quoted: msg });
  }
}
