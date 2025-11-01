import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

export const command = 'toimg';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  
  const rwait = '⏳';
  const done = '✅';
  const error = '❌';
  const emoji = '⚠️';

  const react = emoji => sock.sendMessage(from, { react: { text: emoji, key: msg.key } });

  const quoted = msg.message?.extendedTextMessage?.contextInfo;
  const quotedMsg = quoted?.quotedMessage;

  if (!quotedMsg || !quotedMsg.stickerMessage) {
    return sock.sendMessage(from, { text: `${emoji} Responde a un **sticker** para convertirlo en imagen.` });
  }

  const mime = quotedMsg.stickerMessage.mimetype || '';
  if (!/webp/.test(mime)) {
      return sock.sendMessage(from, { text: `${emoji} El mensaje citado no es un sticker válido.` });
  }

  await react(rwait);

  const outputPath = path.join(tmpdir(), `image-${Date.now()}.jpg`);
  let imgBuffer;

  try {
    imgBuffer = await downloadMediaMessage(
        { key: { remoteJid: from, id: msg.key.id, fromMe: msg.key.fromMe }, message: quotedMsg },
        'buffer',
        {},
        { logger: console }
    );
    
    if (!imgBuffer) throw new Error('No se pudo descargar el sticker.');

    await writeFile(outputPath, imgBuffer);

    await sock.sendMessage(from, { 
        image: imgBuffer, 
        caption: 'Aquí tienes tu imagen convertida.' 
    }, { quoted: msg });

    await react(done);

  } catch (err) {
    console.error('Error en toimg:', err);
    await react(error);
    
    sock.sendMessage(from, { text: `${error} Error al convertir el sticker: ${err.message}` });
  } finally {
    try {
        if (fs.existsSync(outputPath)) {
            await unlink(outputPath);
        }
    } catch (e) {
        console.error("Error al limpiar el archivo temporal:", e);
    }
  }
}

