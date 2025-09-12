import { GoogleGenerativeAI } from '@google/generative-ai';

export const command = 'bot';

const API_KEY = 'AIzaSyA--ZSJYt_E82s2dVnApj0qvRxR2qIY23g';
const genAI = new GoogleGenerativeAI(API_KEY);

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const prompt = args.join(' ');

  if (!prompt) {
    await sock.sendMessage(from, { text: '❌ Por favor, hazme una pregunta. Ejemplo: *.gemini ¿Cuál es la capital de Chile?*' });
    return;
  }

  const loadingMsg = await sock.sendMessage(from, { text: `⏳ Pensando en una respuesta...` });

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    await sock.sendMessage(from, { text: `🤖 *PandaBot AI*\n\n${text}` }, { quoted: loadingMsg });

  } catch (error) {
    console.error('❌ Error en el comando gemini:', error);
    await sock.sendMessage(from, { text: `❌ Ocurrió un error al contactar a la IA. Revisa tu clave de API.` }, { quoted: loadingMsg });
  }
}

