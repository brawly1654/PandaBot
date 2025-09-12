import yts from 'yt-search';

export const command = 'youtube';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (args.length === 0) {
    await sock.sendMessage(from, { text: '⚠️ Debes escribir un término para buscar.\nEjemplo: *.youtube música chill*' });
    return;
  }

  const busqueda = args.join(' ');

  await sock.sendMessage(from, { text: `🔎 Buscando videos para: *${busqueda}* ...` });

  try {
    const resultados = await yts(busqueda);
    const videos = resultados.videos.slice(0, 10);

    if (videos.length === 0) {
      await sock.sendMessage(from, { text: '❌ No encontré resultados para esa búsqueda.' });
      return;
    }

    let mensaje = `🎥 *Resultados de YouTube para:* _${busqueda}_\n\n`;
    for (let i = 0; i < videos.length; i++) {
      const v = videos[i];
      mensaje += `*${i + 1}.* ${v.title}\n⏱ Duración: ${v.timestamp}\n▶️ https://youtu.be/${v.videoId}\n\n`;
    }

    await sock.sendMessage(from, { text: mensaje.trim() });
  } catch (error) {
    console.error('Error en búsqueda YouTube:', error);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error buscando videos. Intenta más tarde.' });
  }
}
