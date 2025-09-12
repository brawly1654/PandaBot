import { downloadMediaMessage } from '@whiskeysockets/baileys';
import Jimp from 'jimp';
import { exec } from 'child_process';
import path from 'path';
import { tmpdir } from 'os';
import fs from 'fs';

export const command = 'magik';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const isImage = quoted?.imageMessage;

  if (!isImage) {
    await sock.sendMessage(from, { text: '❌ Cita una imagen para aplicar el efecto magik.' }, { quoted: msg });
    return;
  }

  try {
    const stream = await downloadMediaMessage(quoted.imageMessage, 'buffer', {}, { logger: console });
    const inputPath = path.join(tmpdir(), `input-${Date.now()}.jpg`);
    const outputPath = path.join(tmpdir(), `magik-${Date.now()}.gif`);
    fs.writeFileSync(inputPath, stream);

    // El efecto magik se logra mejor con ImageMagick, que ffmpeg no puede hacer fácilmente.
    // Usaremos un comando shell si ImageMagick está disponible.
    exec(`convert "${inputPath}" -liquid-rescale 50x50% -resize 200% "${outputPath}"`, async (err) => {
      fs.unlinkSync(inputPath);
      if (err) {
        console.error('❌ Error en el comando magik (requiere ImageMagick):', err);
        await sock.sendMessage(from, { text: '❌ Error al procesar la imagen. Asegúrate de tener ImageMagick instalado.' }, { quoted: msg });
        return;
      }
      const processedBuffer = fs.readFileSync(outputPath);
      await sock.sendMessage(from, { image: processedBuffer, caption: '✅ Efecto magik aplicado.' }, { quoted: msg });
      fs.unlinkSync(outputPath);
    });

  } catch (e) {
    console.error('❌ Error en el comando magik:', e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar la imagen.' }, { quoted: msg });
  }
}

