import fetch from 'node-fetch';

export const command = 'letra';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  if (!args[0]) return await sock.sendMessage(from, { text: '🎶 Escribe el nombre de la canción.\nEjemplo: *.letra Imagine*' });

  const titulo = args.join(' ');
  try {
    const res = await fetch(`https://some-random-api.com/lyrics?title=${encodeURIComponent(titulo)}`);
    const data = await res.json();

    if (!data?.lyrics) throw new Error();

    const texto = `🎵 *${data.title}* - ${data.author}\n\n${data.lyrics.substring(0, 4090)}`;
    await sock.sendMessage(from, { text: texto });
  } catch {
    await sock.sendMessage(from, { text: '❌ No se encontró la letra de la canción.' });
  }
}
