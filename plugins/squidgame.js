export const command = 'squidgame';
//export const aliases = ['milovid', 'milojvideo'];

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    // Avisar que se está cargando el video
    await sock.sendMessage(from, {
      text: '⏳ Cargando edit de Squid Game...'
    }, { quoted: msg });

    // Lista de enlaces de videos
    const videosMiloJ = [
      'https://files.catbox.moe/mjcyf5.mp4',
      'https://files.catbox.moe/gyc1yx.mp4',
      'https://files.catbox.moe/xo9lfu.mp4',
      'https://files.catbox.moe/6zk9jt.mp4',
      'https://files.catbox.moe/uv7qvp.mp4',
      'https://files.catbox.moe/ftmsj6.mp4',
      'https://files.catbox.moe/hxa4ou.mp4',
      'https://files.catbox.moe/8tm193.mp4',
      'https://files.catbox.moe/wjxx2t.mp4',
      'https://files.catbox.moe/347ntw.mp4',
      'https://files.catbox.moe/kkcynv.mp4',
      'https://files.catbox.moe/lwvqcj.mp4',
      'https://files.catbox.moe/31mevt.mp4',
      'https://files.catbox.moe/7fj67q.mp4',
      'https://files.catbox.moe/14py94.mp4',
      'https://files.catbox.moe/rogdgt.mp4',
      'https://files.catbox.moe/wtnjuk.mp4',
      'https://files.catbox.moe/6frgli.mp4',
      'https://files.catbox.moe/x3jugl.mp4',
      'https://files.catbox.moe/69sfml.mp4',
      'https://files.catbox.moe/e82t3j.mp4',
      'https://files.catbox.moe/6skeso.mp4',
      'https://files.catbox.moe/24asgy.mp4',
      'https://files.catbox.moe/ovg47b.mp4',
      'https://files.catbox.moe/bumqz1.mp4',
      'https://files.catbox.moe/1njhhv.mp4',
      'https://files.catbox.moe/2zkgur.mp4',
      'https://files.catbox.moe/hw2tka.mp4',
      'http://localhost:8000/upload/wraithedits7_2025-08-10-17-05-43_1754859943067.mp4',
      'http://localhost:8000/upload/mataabuelas3000ml_2025-08-10-17-07-18_1754860038328.mp4'
    ];

    // Elegir uno aleatorio
    const randomVideo = videosMiloJ[Math.floor(Math.random() * videosMiloJ.length)];

    // Enviar el video
    await sock.sendMessage(from, {
      video: { url: randomVideo },
      caption: '🎬 Edit aleatorio de Squid Game*'
    }, { quoted: msg });

  } catch (err) {
    console.error('Error al enviar el video.', err);
    await sock.sendMessage(from, {
      text: '❌ Ocurrió un error al cargar el video.'
    }, { quoted: msg });
  }
}
