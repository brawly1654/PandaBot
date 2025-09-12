import fetch from 'node-fetch';

export const command = 'tiempo';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const city = args.join(' ');
  if (!city) {
    await sock.sendMessage(from, { text: '🌤️ Usa: *.tiempo ciudad*' });
    return;
  }

  try {
    const res = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=3`);
    const text = await res.text();
    await sock.sendMessage(from, { text: `🌡️ ${text}` });
  } catch (e) {
    await sock.sendMessage(from, { text: '❌ No se pudo obtener el clima.' });
  }
}
