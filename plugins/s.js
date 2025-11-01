import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { exec } from 'child_process';
import { writeExifImg } from '../lib/sticker.js';

export const command = 's';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const description = args.join(' ') || 'Sticker creado con PandaBot 🐼';

  if (!quoted || (!quoted.imageMessage && !quoted.videoMessage)) {
    await sock.sendMessage(from, {
      text: '❌ Responde a una imagen o video con `.s [descripción opcional]` para crear un sticker.'
    }, { quoted: msg });
    return;
  }

  try {
    const buffer = await downloadMediaMessage(
      { key: { remoteJid: from, id: msg.key.id, fromMe: msg.key.fromMe }, message: quoted },
      'buffer',
      {},
      { logger: console }
    );

    const isVideo = !!quoted.videoMessage;
    const ext = isVideo ? 'mp4' : 'jpg';
    const inputPath = path.join(tmpdir(), `input-${Date.now()}.${ext}`);
    const outputPath = path.join(tmpdir(), `sticker-${Date.now()}.webp`);
    fs.writeFileSync(inputPath, buffer);

    const ffmpegCmd = isVideo
      ? `ffmpeg -i "${inputPath}" -vf "scale=512:512,fps=15,format=rgba" -loop 0 -preset default -an -vsync 0 "${outputPath}"`
      : `ffmpeg -i "${inputPath}" -vf "scale=512:512,format=rgba" -loop 0 -preset default -an -vsync 0 "${outputPath}"`;

    exec(ffmpegCmd, async (err) => {
      if (err) {
        console.error(err);
        await sock.sendMessage(from, { text: '❌ Error al crear el sticker.' }, { quoted: msg });
        return;
      }

      const stickerBuffer = fs.readFileSync(outputPath);

      if (isVideo) {
        // 🎞️ Animado: enviar sin metadatos
        await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
      } else {
        // 🏷️ Estático: agregar metadatos usando writeExifImg
        const stickerWithExif = await writeExifImg(stickerBuffer, {
          packname: 'PandaBot 🐼',
          author: 'by lukas 💻',
          description
        });
        await sock.sendMessage(from, { sticker: stickerWithExif }, { quoted: msg });
      }

      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  } catch (err) {
    console.error('❌ Error al crear el sticker:', err);
    await sock.sendMessage(from, { text: '❌ Error al procesar el sticker.' }, { quoted: msg });
  }
}
