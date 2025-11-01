import { downloadMediaMessage } from '@whiskeysockets/baileys';
import * as Jimp from 'jimp'; // Importación final corregida

export const command = 'deepfry';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;

  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  const quotedMessage = contextInfo?.quotedMessage;
  const directImage = msg.message?.imageMessage;

  let messageToDownload = null;

  // 1. Caso: Imagen Citada (Patrón Robusto)
  if (quotedMessage?.imageMessage) {
      messageToDownload = { 
          key: { 
              remoteJid: from, 
              id: msg.key.id, 
              fromMe: msg.key.fromMe 
          }, 
          message: quotedMessage 
      };
  } 
  // 2. Caso: Imagen Directa
  else if (directImage) {
      messageToDownload = msg.message;
  }

  if (!messageToDownload) {
    await sock.sendMessage(from, { text: '❌ Cita una imagen o envía una imagen con el comando `.deepfry`.' }, { quoted: msg });
    return;
  }

  try {
    // La descarga (solución robusta para 'No message present')
    const stream = await downloadMediaMessage(
        messageToDownload,
        'buffer', 
        {}, 
        { 
            logger: console,
            reuploadRequest: sock.updateMediaMessage 
        }
    );

    // Jimp ahora debería funcionar correctamente
    const image = await Jimp.read(stream);

    // Efecto "Deepfry"
    image.color([
            { apply: 'saturate', params: [100] }, 
            { apply: 'contrast', params: [80] }   
         ])
         .sharpen(3) 
         .quality(5); 

    const processedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    await sock.sendMessage(from, { image: processedBuffer, caption: '✅ Efecto deepfry aplicado.' }, { quoted: msg });

  } catch (e) {
    console.error('❌ Error en el comando deepfry:', e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar la imagen.' }, { quoted: msg });
  }
}

