import translate from '@vitalets/google-translate-api';

export const command = 'traducir';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const body = args.join(' ').split('|');
  if (body.length < 2) {
    await sock.sendMessage(from, { text: '⚠️ Usa el formato: *.traducir es | Hello world*' });
    return;
  }

  const [lang, text] = body.map(p => p.trim());

  try {
    const res = await translate(text, { to: lang });
    await sock.sendMessage(from, {
      text: `🌐 Traducción (${lang}):\n\n${res.text}`
    });
  } catch (e) {
    await sock.sendMessage(from, { text: '❌ Error al traducir. Asegúrate de usar un idioma válido.' });
  }
}
