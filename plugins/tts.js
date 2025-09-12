import axios from 'axios';

export const command = 'tts';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  let lang = args[0];
  let text = args.slice(1).join(' ');

  if (!lang || lang.length !== 2) {
    lang = 'es';
    text = args.join(' ');
  }

  if (!text && msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.conversation) {
    text = msg.message.extendedTextMessage.contextInfo.quotedMessage.conversation;
  }

  if (!text) {
    await sock.sendMessage(from, { text: '❌ Debes escribir un texto. Ejemplo:\n.tts es Hola mundo' });
    return;
  }

  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const audioBuffer = Buffer.from(response.data, 'binary');

    await sock.sendMessage(from, { audio: audioBuffer, mimetype: 'audio/mpeg', ptt: true });
  } catch (e) {
    console.error('❌ Error en tts:', e);
    await sock.sendMessage(from, { text: `⚠️ Error al generar TTS.` });
  }
}
