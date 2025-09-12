import fetch from 'node-fetch';

export const command = 'acortar';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  if (!args[0]) return await sock.sendMessage(from, { text: '🔗 Debes proporcionar una URL para acortar.\nEjemplo: *.acortar https://google.com*' });

  try {
    const res = await fetch(`https://tinyurl.com/api-create.php?url=${args[0]}`);
    const short = await res.text();
    await sock.sendMessage(from, { text: `🔗 URL acortada:\n${short}` });
  } catch (e) {
    await sock.sendMessage(from, { text: '❌ Error al acortar la URL.' });
  }
}
