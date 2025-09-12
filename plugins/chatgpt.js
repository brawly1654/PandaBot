import axios from 'axios';

export const command = 'chatgpt';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.pushName || 'Amigo';

  const basePrompt = `Tu nombre es PandaBot, creado por Lukas. Respondes en español, eres divertida, te encantan las explosiones y siempre eres amigable con ${sender}.`;

  // Si el mensaje es respuesta a una imagen
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const isQuotedImage = quoted && quoted.imageMessage;

  if (isQuotedImage) {
    await sock.sendMessage(from, { text: '🕒 Analizando la imagen...' });

    try {
      // Descarga la imagen
      const imageBuffer = await sock.downloadMediaMessage(
        { message: quoted },
        'buffer'
      );

      if (!imageBuffer) {
        await sock.sendMessage(from, { text: '🚩 No se pudo descargar la imagen.' });
        return;
      }

      const content = '🚩 ¿Qué se observa en la imagen?';
      const imageAnalysis = await fetchImageBuffer(content, imageBuffer);

      const query = '😊 Descríbeme la imagen y por qué es así. Y dime quién eres.';
      const prompt = `${basePrompt} La imagen que se analiza es: ${imageAnalysis.result}`;

      const description = await askLuminai(query, sender, prompt);

      await sock.sendMessage(from, { text: description });
    } catch (error) {
      console.error('❌ Error al analizar la imagen:', error);
      await sock.sendMessage(from, { text: '🚩 Ocurrió un error al analizar la imagen.' });
    }
    return;
  }

  // Si solo es texto
  const text = args.join(' ');
  if (!text) {
    await sock.sendMessage(from, { text: '🍟 Ingresa tu pregunta o petición.\nEjemplo: .chatgpt Cómo hacer un avión de papel' });
    return;
  }

  await sock.sendMessage(from, { text: '💬 Pensando...' });

  try {
    const prompt = `${basePrompt} Responde lo siguiente: ${text}`;
    const response = await askLuminai(text, sender, prompt);
    await sock.sendMessage(from, { text: response });
  } catch (error) {
    console.error('❌ Error al obtener la respuesta:', error);
    await sock.sendMessage(from, { text: '🚩 Error, intenta más tarde.' });
  }
}

// Enviar imagen a la API para análisis
async function fetchImageBuffer(content, imageBuffer) {
  try {
    const res = await axios.post('https://Luminai.my.id', {
      content: content,
      imageBuffer: imageBuffer
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  } catch (error) {
    console.error('❌ Error al analizar imagen:', error);
    throw error;
  }
}

// Preguntar a la IA
async function askLuminai(q, username, prompt) {
  try {
    const res = await axios.post('https://Luminai.my.id', {
      content: q,
      user: username,
      prompt: prompt,
      webSearchMode: false
    });
    return res.data.result;
  } catch (error) {
    console.error('❌ Error al pedir a Luminai:', error);
    throw error;
  }
}
