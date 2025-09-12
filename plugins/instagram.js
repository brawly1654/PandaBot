import { igdl } from 'ruhend-scraper';

export const command = 'instagram';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (!args[0]) {
    await sock.sendMessage(from, { text: '🚩 Ingresa un enlace de Instagram.\n\n📌 Ejemplo:\n.instagram https://www.instagram.com/reel/xxxxx/' });
    return;
  }

  try {
    await sock.sendMessage(from, { text: '🕒 Enviando el video...' });

    const res = await igdl(args[0]);
    const data = res.data;

    if (!data || data.length === 0) {
      await sock.sendMessage(from, { text: '❎ No se encontraron videos en el enlace.' });
      return;
    }

    for (const media of data) {
      await new Promise(resolve => setTimeout(resolve, 1500)); // pausa para no saturar
      await sock.sendMessage(from, {
        video: { url: media.url },
        caption: '🚩 *Video de Instagram.*'
      });
    }
  } catch (e) {
    console.error('❌ Error en instagram:', e);
    await sock.sendMessage(from, { text: '🚩 Ocurrió un error al descargar.' });
  }
}
