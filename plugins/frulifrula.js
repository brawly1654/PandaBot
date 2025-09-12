export const command = 'frulifrula';

export async function run(sock, msg, args) {                                                                                           const from = msg.key.remoteJid;

  try {
    // Lista de enlaces de videos
    const videosMiloJ = [
  'http://localhost:8000/upload/capybarawt_2025-08-05-21-15-56_1754442956821.mp4'
    ];

    // Elegir uno aleatorio
    const randomVideo = videosMiloJ[Math.floor(Math.random() * videosMiloJ.length)];

    // Enviar el video
    await sock.sendMessage(from, {
      video: { url: randomVideo },
      caption: ''
    }, { quoted: msg });

  } catch (err) {
    console.error('Error al enviar el video.', err);
    await sock.sendMessage(from, {
      text: '❌ Ocurrió un error al cargar el video.'
    }, { quoted: msg });
  }
}
