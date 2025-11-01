import yts from 'yt-search';
import play from 'play-dl';

export const command = 'play';

function formatViews(views) {
  return views >= 1000
    ? (views / 1000).toFixed(1) + 'k (' + views.toLocaleString() + ')'
    : views.toString();
}

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const userId = sender.split('@')[0];
  const text = args.join(' ');

  if (!text) {
    await sock.sendMessage(from, {
      text: '⚔️ Ingresa el nombre de la música o video a buscar.'
    });
    return;
  }

  const creditosCosto = 50;

  if (!global.cmDB[userId]) {
    global.cmDB[userId] = {
      spins: 5,
      coins: 0,
      shields: 0,
      villageLevel: 1,
      creditos: 0
    };
  }

  const userCreditos = global.cmDB[userId].creditos;
  if (userCreditos < creditosCosto) {
    await sock.sendMessage(from, {
      text: `❌ No tienes suficientes créditos para usar este comando. Cuesta *${creditosCosto} créditos* y tienes *${userCreditos}*.`
    }, { quoted: msg });
    return;
  }

  try {
    // Buscar video en YouTube
    const search = await yts(text);
    const video = search.videos.find(v => v.videoId); // solo videos válidos

    if (!video) {
      await sock.sendMessage(from, { text: '❗ No se encontraron resultados válidos.' });
      return;
    }

    // Construir URL segura
    const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

    // Validar con play-dl
    const isValid = await play.validate(videoUrl);
    if (!isValid) {
      await sock.sendMessage(from, { text: '❌ El link obtenido no es válido para play-dl.' });
      return;
    }

    // Descontar créditos
    global.cmDB[userId].creditos -= creditosCosto;
    global.guardarCM();

    const infoMessage = `
🎵 *${video.title}*
👀 *Vistas:* ${formatViews(video.views)}
⏱️ *Duración:* ${video.timestamp}
📅 *Publicado:* ${video.ago}
🔗 *URL:* ${videoUrl}

_🪙 Se han descontado *${creditosCosto} créditos* de tu cuenta._
_🐼 Enviando audio, espere un momento..._
`;

    await sock.sendMessage(from, {
      image: { url: video.thumbnail },
      caption: infoMessage
    });

    try {
      // Obtener stream de audio con play-dl
      const stream = await play.stream(videoUrl);

      await sock.sendMessage(from, {
        audio: stream.stream,
        mimetype: 'audio/mpeg'
      }, { quoted: msg });

    } catch (err) {
      console.error('⚠️ Error al obtener audio con play-dl:', err.message);
      await sock.sendMessage(from, {
        text: `⚠️ No se pudo procesar el audio automáticamente.\nAquí tienes el link directo: ${videoUrl}`
      }, { quoted: msg });
    }

  } catch (e) {
    console.error('Error en comando play:', e);
    await sock.sendMessage(from, {
      text: `⚠️ Error en .play: ${e.message}`
    });
  }
}
