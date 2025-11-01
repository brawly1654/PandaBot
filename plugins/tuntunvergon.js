export const command = 'tuntunvergon';

export async function run(sock, msg, args) {                                                                                           const from = msg.key.remoteJid;

  try {
    const videosMiloJ = [
      'http://localhost:8000/upload/crack8029_2025-09-20-23-22-55_1758421375549.mp4'
    ];

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

