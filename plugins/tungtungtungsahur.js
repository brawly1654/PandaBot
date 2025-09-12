export const command = 'tungtungtungsahur';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    // Lista de enlaces de videos
    const videosMiloJ = [
      'http://localhost:8000/upload/VID-20250805-WA0153.mp4'
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

