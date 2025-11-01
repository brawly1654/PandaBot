import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { tmpdir } from 'os';

export const command = 'toaudio';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

  if (!quoted || !quoted.videoMessage) {
    await sock.sendMessage(from, { text: '❌ Debes citar un video para convertirlo a audio.' }, { quoted: msg });
    return;
  }

  const buffer = await downloadMediaMessage(
    { key: quoted.key, message: quoted }, 
    'buffer',
    {},
    { logger: console, reuploadRequest: sock.updateMediaMessage }
  );

  const inputPath = path.join(tmpdir(), `video-${Date.now()}.mp4`);
  const outputPath = path.join(tmpdir(), `audio-${Date.now()}.opus`); 
  fs.writeFileSync(inputPath, buffer);

  await sock.sendMessage(from, { text: '🔄 Procesando audio, por favor espera...' }, { quoted: msg });

  ffmpeg(inputPath)
    .outputOptions([
        '-vn', 
        '-acodec libopus',
        '-b:a 128k',
        '-vbr on',
        '-f opus'
    ]) 
    .save(outputPath)
    .on('end', async () => {
      try {
        const audioBuffer = fs.readFileSync(outputPath);
        
        await sock.sendMessage(from, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: msg });

        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      } catch (e) {
        console.error('Error al enviar/limpiar archivos:', e);
        await sock.sendMessage(from, { text: '❌ Error al enviar el archivo OPUS. Intenta de nuevo.' }, { quoted: msg });
      }
    })
    .on('error', async err => {
      console.error('Error en ffmpeg:', err);
      try {
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      } catch {}
      await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar el audio con FFmpeg.' }, { quoted: msg });
    });
}

