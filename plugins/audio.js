import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export const command = 'audio';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const url = args[0];

  if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
    await sock.sendMessage(from, { text: '❌ Proporcióname un enlace válido de YouTube.' }, { quoted: msg });
    return;
  }

  let info;
  try {
    info = await ytdl.getInfo(url);
  } catch (e) {
    await sock.sendMessage(from, { text: '❌ No se pudo obtener información del video.' }, { quoted: msg });
    return;
  }

  const durationSec = parseInt(info.videoDetails.lengthSeconds);
  if (durationSec > 300) {
    await sock.sendMessage(from, { text: '❌ El video no debe durar más de 5 minutos.' }, { quoted: msg });
    return;
  }

  const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
  const outputPath = path.join('/tmp', `${title}.mp3`);

  await sock.sendMessage(from, { text: '⏳ Descargando audio...' }, { quoted: msg });

  try {
    const stream = ytdl(url, { filter: 'audioonly' });
    const proc = exec(`ffmpeg -i pipe:0 -vn -b:a 128k "${outputPath}"`);
    stream.pipe(proc.stdin);

    await new Promise((resolve, reject) => {
      proc.on('close', (code) => code === 0 ? resolve() : reject(new Error('Fallo en ffmpeg')));
    });

    const audio = fs.readFileSync(outputPath);
    await sock.sendMessage(from, {
      audio,
      mimetype: 'audio/mp4',
      ptt: false
    }, { quoted: msg });

    fs.unlinkSync(outputPath);
  } catch (err) {
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar el audio.' }, { quoted: msg });
  }
}
