import { downloadMediaMessage } from '@whiskeysockets/baileys';
import Jimp from 'jimp';

export const command = 'glitch';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const isImage = quoted?.imageMessage;

  if (!isImage) {
    await sock.sendMessage(from, { text: '❌ Cita una imagen para aplicar el efecto glitch.' }, { quoted: msg });
    return;
  }

  try {
    const stream = await downloadMediaMessage(quoted.imageMessage, 'buffer', {}, { logger: console });
    const image = await Jimp.read(stream);

    image.convolute([
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
    ])
    .quality(50);
    
    const processedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    await sock.sendMessage(from, { image: processedBuffer, caption: '✅ Efecto glitch aplicado.' }, { quoted: msg });

  } catch (e) {
    console.error('❌ Error en el comando glitch:', e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar la imagen.' }, { quoted: msg });
  }
}

