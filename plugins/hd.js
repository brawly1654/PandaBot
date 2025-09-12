import axios from "axios";
import uploadImage from "../uploadImage.js";

export const command = 'hd';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    await sock.sendMessage(from, { react: { text: "🕓", key: msg.key } });

    // Tu código original usa 'q = m.quoted || m'.
    // Baileys permite descargar directamente desde el objeto de mensaje que contiene el medio.
    // m.message es el contenido del mensaje.
    // Si m.message tiene un imageMessage, o si está citando un imageMessage.

    const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const isQuotedImage = quotedMessage && (quotedMessage.imageMessage || (quotedMessage.stickerMessage && !quotedMessage.stickerMessage.isAnimated));
    const isDirectImage = msg.message?.imageMessage;

    let targetMessage; // Este será el objeto del mensaje del cual intentaremos descargar el medio
    let mime;

    if (isQuotedImage) {
      // Si es una imagen o sticker no animado citado
      targetMessage = quotedMessage;
      // Obtener el tipo de mensaje para extraer el mimetype
      const type = Object.keys(quotedMessage)[0];
      mime = quotedMessage[type].mimetype;
    } else if (isDirectImage) {
      // Si el mensaje actual es una imagen
      targetMessage = msg.message;
      mime = msg.message.imageMessage.mimetype;
    } else {
      // No se encontró una imagen adecuada
      await sock.sendMessage(from, { text: "> 𝘙𝘦𝘴𝘱𝘰𝘯𝘥𝘦 𝘢 𝘶𝘯𝘢 𝘪𝘮𝘢𝘨𝘦𝘯 𝘰 𝘶𝘯 𝘴𝘵𝘪𝘤𝘬𝘦𝘳 𝘯𝘰 𝘢𝘯𝘪𝘮𝘢𝘥𝘰 𝘱𝘢𝘳𝘢 𝘵𝘳𝘢𝘯𝘴𝘧𝘰𝘳𝘮𝘢𝘳𝘭𝘢 𝘦𝘯 𝘏𝘋." }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: "✖️", key: msg.key } });
      return;
    }

    if (!mime || !mime.startsWith("image/")) {
      await sock.sendMessage(from, { text: "> 𝘙𝘦𝘴𝘱𝘰𝘯𝘥𝘦 𝘢 𝘶𝘯𝘢 𝘪𝘮𝘢𝘨𝘦𝘯 𝘰 𝘶𝘯 𝘴𝘵𝘪𝘤𝘬𝘦𝘳 𝘯𝘰 𝘢𝘯𝘪𝘮𝘢𝘥𝘰 𝘱𝘢𝘳𝘢 𝘵𝘳𝘢𝘯𝘴𝘧𝘰𝘳𝘮𝘢𝘳𝘭𝘢 𝘦𝘯 𝘏𝘋." }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: "✖️", key: msg.key } });
      return;
    }

    // *** EL CAMBIO CLAVE AQUÍ: usar sock.downloadMediaMessage(targetMessage) ***
    // 'targetMessage' ahora es el objeto que realmente contiene los datos de la imagen
    const imgBuffer = await sock.downloadMediaMessage(targetMessage);

    const urlSubida = await uploadImage(imgBuffer);
    if (!urlSubida) {
      throw new Error("No se pudo subir la imagen para mejorarla.");
    }

    const upscaledBuffer = await getUpscaledImage(urlSubida);

    await sock.sendMessage(from, {
      image: upscaledBuffer,
      caption: "> 𝘈𝘲𝘶í 𝘵𝘪𝘦𝘯𝘦 𝘴𝘶 𝘪𝘮𝘢𝘨𝘦𝘯 mejorada.",
    }, { quoted: msg });

    await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

  } catch (e) {
    console.error("Error al mejorar la imagen:", e);
    await sock.sendMessage(from, { react: { text: "✖️", key: msg.key } });
    await sock.sendMessage(from, { text: "> Ocurrió un error al mejorar la imagen." }, { quoted: msg });
  }
}

async function getUpscaledImage(imageUrl) {
  const apiUrl = `https://jerofc.my.id/api/remini?url=${encodeURIComponent(imageUrl)}`;
  const apiResponse = await axios.get(apiUrl, { responseType: 'json' });

  if (!apiResponse.data?.status || !apiResponse.data.data?.image) {
    throw new Error('La API de mejora devolvió una respuesta inválida o no hay imagen.');
  }

  const enhancedImageUrl = apiResponse.data.data.image;
  const imageResponse = await axios.get(enhancedImageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(imageResponse.data);
}

