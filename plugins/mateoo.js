export const command = 'mateoo';

export async function run(sock, msg, args) {
const from = msg.key.remoteJid

  try {
    const videosMiloJ = [
      'http://localhost:8000/upload/pollonavale_2025-08-25-06-03-13_1756116193201.mp4'
    ];
                                                                                                                                         // Elegir uno aleatorio
    const randomVideo = videosMiloJ[Math.floor(Math.random() * videosMiloJ.length)];

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

