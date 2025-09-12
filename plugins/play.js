import yts from 'yt-search';
import axios from 'axios';
import fs from 'fs';

export const command = 'play';

// helpers
function formatViews(views) {
  return views >= 1000 ? (views / 1000).toFixed(1) + 'k (' + views.toLocaleString() + ')' : views.toString();
}

async function downloadAudio(url) {
  const apiUrl = `https://p.oceansaver.in/ajax/download.php?format=mp3&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`;
  const res = await axios.get(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (res.data?.success) {
    const downloadUrl = await checkProgress(res.data.id);
    return { downloadUrl };
  }
  throw new Error('No se pudo descargar el audio');
}

async function checkProgress(id) {
  const url = `https://p.oceansaver.in/ajax/progress.php?id=${id}`;
  while (true) {
    const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (res.data?.success && res.data.progress === 1000) {
      return res.data.download_url;
    }
    await new Promise(r => setTimeout(r, 5000));
  }
}

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const userId = sender.split('@')[0];

  const text = args.join(' ');
  if (!text) {
    await sock.sendMessage(from, { text: '⚔️ Ingresa el nombre de la música o video a buscar.' });
    return;
  }
  
  const creditosCosto = 50;

  // Asegurar la existencia de los datos del usuario en cmDB
  if (!global.cmDB[userId]) {
    global.cmDB[userId] = {
      spins: 5,
      coins: 0,
      shields: 0,
      villageLevel: 1,
      creditos: 0
    };
  }

  // --- Lógica para verificar y descontar créditos ---
  const userCreditos = global.cmDB[userId].creditos;
  if (userCreditos < creditosCosto) {
    await sock.sendMessage(from, {
      text: `❌ No tienes suficientes créditos para usar este comando. Cuesta *${creditosCosto} créditos* y tienes *${userCreditos}*.`
    }, { quoted: msg });
    return;
  }
  
  try {
    const search = await yts(text);
    const video = search.videos[0];
    if (!video) {
      await sock.sendMessage(from, { text: '❗ No se encontraron resultados.' });
      return;
    }

    // Descontar créditos y guardar el cambio
    global.cmDB[userId].creditos -= creditosCosto;
    global.guardarCM();

    const infoMessage = `
🎵 *${video.title}*
👀 *Vistas:* ${formatViews(video.views)}
⏱️ *Duración:* ${video.timestamp}
📅 *Publicado:* ${video.ago}
🔗 *URL:* ${video.url}

_🪙 Se han descontado *${creditosCosto} créditos* de tu cuenta._
_🐼Enviando audio, espere un momento..._

━━━━━━━━━━━━━━━━━━━
🔗 *Canal Oficial:*
https://whatsapp.com/channel/0029Vb6SmfeAojYpZCHYVf0R
━━━━━━━━━━━━━━━━━━━
`;

    await sock.sendMessage(from, { image: { url: video.thumbnail }, caption: infoMessage });

    // Descarga el audio
    const api = await downloadAudio(video.url);
    await sock.sendMessage(from, { audio: { url: api.downloadUrl }, mimetype: 'audio/mpeg' });

  } catch (e) {
    console.error(e);
    await sock.sendMessage(from, { text: `⚠️ Error: ${e.message}` });
  }
}

