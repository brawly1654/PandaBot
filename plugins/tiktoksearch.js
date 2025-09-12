import axios from 'axios';

export const command = 'tiktoksearch';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (args.length === 0) {
    await sock.sendMessage(from, {
      text: '⚠️ *Uso incorrecto del comando:*\n📌 .tiktoksearch <consulta>\n\n✳️ Ejemplo:\n*tiktoksearch bad bunny*'
    });
    return;
  }

  const query = args.join(' ');
  const apiUrl = `https://api.dorratz.com/v2/tiktok-s?q=${encodeURIComponent(query)}`;

  await sock.sendMessage(from, {
    react: { text: '⏳', key: msg.key }
  });

  try {
    const response = await axios.get(apiUrl);

    if (response.data.status !== 200 || !response.data.data || response.data.data.length === 0) {
      await sock.sendMessage(from, { text: '❌ No se encontraron resultados para tu búsqueda.' });
      return;
    }

    const results = response.data.data.slice(0, 5);

    const resultText = results.map((video, i) => `
🎬 *Resultado ${i + 1}*
📹 *Título:* ${video.title}
👤 *Autor:* ${video.author.nickname} (@${video.author.username})
👁️‍🗨️ *Vistas:* ${video.play.toLocaleString()}
❤️ *Likes:* ${video.like.toLocaleString()}
💬 *Comentarios:* ${video.coment.toLocaleString()}
🔗 *Enlace:* ${video.url}
`).join('\n');

    await sock.sendMessage(from, {
      text: `🔍 *Resultados de búsqueda en TikTok para:* "${query}"\n\n${resultText}`
    });

    await sock.sendMessage(from, {
      react: { text: '✅', key: msg.key }
    });

  } catch (err) {
    console.error('❌ Error en tiktoksearch:', err);
    await sock.sendMessage(from, {
      text: '❌ Ocurrió un error al buscar en TikTok.'
    });

    await sock.sendMessage(from, {
      react: { text: '❌', key: msg.key }
    });
  }
}
