export const command = 'garammaram';

export async function run(sock, msg, args) {                                                                                           const from = msg.key.remoteJid;

  try {
    // Lista de enlaces de videos
    const videosMiloJ = [
      'http://localhost:8000/upload/noxaasht_2025-08-05-20-46-37_1754441197992.mp4'
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
