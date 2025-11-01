export const command = 'menubrainrots';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const imageUrl = 'http://localhost:8000/upload/file_0000000034d061f8a7a755cd2eebdbd6.png';

  const menuText = `
┣━━━━━━━━━━━━━━━━━━━┫
*🧠BRAINROTS*

🧠 .tungtungtungsahur
> El bot muestra un video de tung tung tung tung tung tung tung tung tung Sahur.

🧠 .garammaram
> El bot muestra un video de Garam and Madungdung.

🧠 .tralalerotralala
> El bot muestra un video de Tralalero Tralala.

🧠 .lostralaleritos
> El bot muestra un video de Los Tralaleritos.

🧠 .lavacca
> El bot muestra un video de La Vacca Saturno Saturnita.

🧠 .agarrinilapalini
> El bot muestra un video de Agarrini La Palini.

🧠 .girafaceleste
> El bot muestra un video de Girafa Celeste.

🧠 .grancombinasion
> El bot muestra un video de La Grande Combinasion.

🧠 .brrbrrpatapim
> El bot muestra un video de Brr Brr Patapim.

🧠 .lirililarila
> El bot muestra un video de Lirili Larila.

🧠 .frulifrula
> El bot muestra un video de Fruli Frula.

🧠 .chicleteira
> El bot muestra un video de Chicleteira Bicicleteira.

🧠 .basbas
> El bot muestra un video de Bas Bas Kotak Bas.

┣━━━━━━━━━━━━━━━━━━━┫
`;
  try {
    await sock.sendMessage(from, {
      image: { url: imageUrl },
      caption: menuText.trim(),
      headerType: 4,
      externalAdReply: {
        title: 'Menú de la Pizzería',
        body: 'Comandos para gestionar tu local',
        mediaType: 1,
        thumbnailUrl: imageUrl,
      }
    }, { quoted: msg });
  } catch (error) {
    console.error('❌ Error enviando el menú de la pizzería:', error);
    await sock.sendMessage(from, {
      text: '❌ Ocurrió un error al cargar el menú de juegos. Intenta más tarde.',
    }, { quoted: msg });
  }
}
