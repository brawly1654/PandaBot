import { createCanvas, loadImage } from 'canvas';
import { sticker } from '../lib/sticker.js'; // Asumiendo que tienes una función para crear stickers

export const command = 'meme';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const isImage = quoted?.imageMessage;

  if (!isImage) {
    await sock.sendMessage(from, { text: '❌ Debes responder a una imagen con *.meme texto1 | texto2* para crear un meme.' });
    return;
  }

  const texto = args.join(' ');
  const partes = texto.split('|').map(t => t.trim());
  const topText = partes[0] || '';
  const bottomText = partes[1] || '';

  if (!topText && !bottomText) {
    await sock.sendMessage(from, { text: '❌ Debes proporcionar al menos un texto para el meme. Ejemplo: *.meme Hola mundo | Esto es un bot*' });
    return;
  }

  try {
    const stream = await sock.downloadMediaMessage(quoted);
    const imageBuffer = Buffer.from([]);
    for await (const chunk of stream) {
      imageBuffer.push(chunk);
    }
    
    const img = await loadImage(imageBuffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(img, 0, 0, img.width, img.height);
    
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = 'bold 50px Arial'; // Puedes ajustar la fuente y el tamaño

    // Función para dibujar el texto
    const drawText = (text, y) => {
      const x = canvas.width / 2;
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    };

    // Dibujar el texto superior
    if (topText) {
      drawText(topText.toUpperCase(), 50); // Posición superior
    }

    // Dibujar el texto inferior
    if (bottomText) {
      drawText(bottomText.toUpperCase(), canvas.height - 20); // Posición inferior
    }

    const buffer = canvas.toBuffer('image/jpeg');

    await sock.sendMessage(from, { image: buffer, caption: '✅ Aquí está tu meme.' });

  } catch (error) {
    console.error('❌ Error al crear el meme:', error);
    await sock.sendMessage(from, { text: 'Hubo un error al procesar la imagen para el meme. Inténtalo de nuevo.' });
  }
}

