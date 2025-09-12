import { downloadMediaMessage } from '@whiskeysockets/baileys';
import Jimp from 'jimp';

export const command = 'greyscale';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const isImage = quoted?.imageMessage;

  if (!isImage) {
    await sock.sendMessage(from, { text: '❌ Cita una imagen para convertirla a escala de grises.' }, { quoted: msg });
    return;
  }

  try {
    const stream = await downloadMediaMessage(quoted.imageMessage, 'buffer', {}, { logger: console });
    const image = await Jimp.read(stream);

    image.greyscale();
    
    const processedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    await sock.sendMessage(from, { image: processedBuffer, caption: '✅ Convertida a escala de grises.' }, { quoted: msg });

  } catch (e) {
    console.error('❌ Error en el comando greyscale:', e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar la imagen.' }, { quoted: msg });
  }
}

