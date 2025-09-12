import fetch from 'node-fetch';

export const command = 'definir';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const word = args.join(' ');
  if (!word) {
    await sock.sendMessage(from, { text: '📘 Usa: *.definir palabra*' });
    return;
  }

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/es/${word}`);
    const data = await res.json();

    if (!Array.isArray(data)) throw 'No se encontró';

    const meanings = data[0].meanings.map(m => `• *${m.partOfSpeech}*: ${m.definitions[0].definition}`).join('\n');

    await sock.sendMessage(from, {
      text: `📖 Definición de *${word}*:\n\n${meanings}`
    });
  } catch (e) {
    await sock.sendMessage(from, { text: `❌ No se encontró una definición para *${word}*.` });
  }
}
