import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';

export const command = 'toaudio';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

  if (!quoted || !quoted.videoMessage) {
    await sock.sendMessage(from, { text: '❌ Debes citar un video para convertirlo a audio.' }, { quoted: msg });
    return;
  }

  // Descarga el video citado
  const buffer = await downloadMediaMessage(
    { key: msg.message.extendedTextMessage.contextInfo.stanzaId, message: quoted },
    'buffer',
    {},
    { logger: console, reuploadRequest: sock.updateMediaMessage }
  );

  // Rutas temporales
  const inputPath = path.join(tmpdir(), `video-${Date.now()}.mp4`);
  const outputPath = path.join(tmpdir(), `audio-${Date.now()}.mp3`);
  fs.writeFileSync(inputPath, buffer);

  // Extrae audio con ffmpeg
  ffmpeg(inputPath)
    .outputOptions('-vn') // no video
    .save(outputPath)
    .on('end', async () => {
      const audioBuffer = fs.readFileSync(outputPath);
      await sock.sendMessage(from, { audio: audioBuffer, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });

      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    })
    .on('error', async err => {
      console.error('Error en ffmpeg:', err);
      await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar el audio.' }, { quoted: msg });
    });
}
