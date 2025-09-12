import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { exec } from 'child_process';

export const command = 'sticker';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

  if (!quoted || (!quoted.imageMessage && !quoted.videoMessage)) {
    await sock.sendMessage(from, { text: '❌ Responde a una imagen o video para hacer sticker.' }, { quoted: msg });
    return;
  }

  // Descargar archivo citado
  const buffer = await downloadMediaMessage(
    { key: { remoteJid: from, id: msg.key.id, fromMe: msg.key.fromMe }, message: quoted },
    'buffer',
    {},
    { logger: console }
  );

  const ext = quoted.imageMessage ? 'jpg' : 'mp4';
  const inputPath = path.join(tmpdir(), `input-${Date.now()}.${ext}`);
  const outputPath = path.join(tmpdir(), `sticker-${Date.now()}.webp`);
  fs.writeFileSync(inputPath, buffer);

  // Escalar forzado a 512x512 (aplastado o estirado)
  exec(`ffmpeg -i "${inputPath}" -vf "scale=512:512,fps=15,format=rgba" -loop 0 -preset default -an -vsync 0 "${outputPath}"`, async (err) => {
    if (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Error al crear el sticker.' }, { quoted: msg });
      return;
    }

    const stickerBuffer = fs.readFileSync(outputPath);
    await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
  });
}
