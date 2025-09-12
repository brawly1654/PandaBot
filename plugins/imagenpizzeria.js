import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { subirImagenPizzeria } from "../PandaLove/pizzeria.js";

export const command = 'imagenpizzeria';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const isImage = quoted?.imageMessage;
  //get JID/LID from quoted
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!isImage) {
    await sock.sendMessage(from, { text: '❌ Responde a una imagen para subirla.' }, { quoted: msg });
    return;
  }

  // Descargar imagen como buffer
  const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
  let buffer = Buffer.from([]);
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  const loadingMsg = await sock.sendMessage(from, { text: `⏳ Subiendo la imagen...` }, { quoted: msg });

  try {
    const filename = `pizzeria_imagen_${Date.now()}.jpg`;
    const result = await subirImagenPizzeria(sender, buffer, filename);

    if (result.number === 200) {
      await sock.sendMessage(from, { text: `✅ Imagen subida` }, { quoted: loadingMsg });
    } else {
      await sock.sendMessage(from, { text: `❌ Error: ${result.error || 'Error desconocido'}` }, { quoted: loadingMsg });
    }
  } catch (err) {
    console.error('❌ Error en el comando imagenpizzeria:', err);
    await sock.sendMessage(from, { text: '❌ Error al subir la imagen al servidor.' }, { quoted: msg });
  }
}
