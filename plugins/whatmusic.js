import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import yts from 'yt-search';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import FormData from 'form-data';

const streamPipeline = promisify(pipeline);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const command = 'whatmusic';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

  if (!quotedMsg || (!quotedMsg.audioMessage && !quotedMsg.videoMessage)) {
    await sock.sendMessage(from, {
      text: `✳️ Responde a una *nota de voz*, *audio* o *video* para identificar la canción.`
    }, { quoted: msg });
    return;
  }

  await sock.sendMessage(from, {
    react: { text: '🔍', key: msg.key }
  });

  try {
    const tmpDir = path.join(__dirname, '../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const fileExt = quotedMsg.audioMessage ? 'mp3' : 'mp4';
    const inputPath = path.join(tmpDir, `${Date.now()}.${fileExt}`);

    const stream = await downloadContentFromMessage(
      quotedMsg.audioMessage || quotedMsg.videoMessage,
      quotedMsg.audioMessage ? 'audio' : 'video'
    );
    const writer = fs.createWriteStream(inputPath);
    for await (const chunk of stream) writer.write(chunk);
    writer.end();

    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', fs.createReadStream(inputPath));
    
    const uploadRes = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
    });
    
    const fileUrl = uploadRes.data.trim();
    if (!fileUrl.startsWith('https://')) throw new Error('No se pudo obtener una URL de subida válida.');

    const apiURL = `https://api.neoxr.eu/api/whatmusic?url=${encodeURIComponent(fileUrl)}&apikey=russellxz`;
    const res = await axios.get(apiURL);
    if (!res.data.status || !res.data.data) throw new Error('No se pudo identificar la canción');

    const { title, artist, album, release } = res.data.data;
    const ytSearch = await yts(`${title} ${artist}`);
    const video = ytSearch.videos[0];
    if (!video) throw new Error("No se encontró la canción en YouTube");

    const banner = `
╔══════════════════╗
║ ✦ PandaBot ✦
╚══════════════════╝

🎵 *Canción detectada:* ╭───────────────╮  
├ 📌 *Título:* ${title}
├ 👤 *Artista:* ${artist}
├ 💿 *Álbum:* ${album}
├ 📅 *Lanzamiento:* ${release}
├ 🔎 *Buscando:* ${video.title}
├ ⏱️ *Duración:* ${video.timestamp}
├ 👁️ *Vistas:* ${video.views.toLocaleString()}
├ 📺 *Canal:* ${video.author.name}
├ 🔗 *Link:* ${video.url}
╰───────────────╯

⏳ *Espere un momento, descargando la canción...*`;

    await sock.sendMessage(from, {
      image: { url: video.thumbnail },
      caption: banner
    }, { quoted: msg });

    const ytRes = await axios.get(`https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(video.url)}&type=audio&quality=128kbps&apikey=russellxz`);
    const audioURL = ytRes.data.data.url;

    const rawPath = path.join(tmpDir, `${Date.now()}_raw.m4a`);
    const finalPath = path.join(tmpDir, `${Date.now()}_final.mp3`);

    const audioRes = await axios.get(audioURL, { responseType: 'stream' });
    await streamPipeline(audioRes.data, fs.createWriteStream(rawPath));

    await new Promise((resolve, reject) => {
      ffmpeg(rawPath)
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .save(finalPath)
        .on('end', resolve)
        .on('error', reject);
    });

    await sock.sendMessage(from, {
      audio: fs.readFileSync(finalPath),
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: msg });

    fs.unlinkSync(inputPath);
    fs.unlinkSync(rawPath);
    fs.unlinkSync(finalPath);

    await sock.sendMessage(from, {
      react: { text: '✅', key: msg.key }
    });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(msg.key.remoteJid, {
      text: `❌ *Error:* ${err.message}`
    }, { quoted: msg });
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: '❌', key: msg.key }
    });
  }
}

