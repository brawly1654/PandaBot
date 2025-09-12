import { PornHub } from 'pornhub.js';
import { ownerNumber } from '../config.js';

export const command = 'pornhubdl';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
 // const owners = ['56912345678']; // Pon tus números autorizados

 // if (!owners.includes(sender.split('@')[0])) {
   // await sock.sendMessage(from, { text: '🚫 Solo el owner puede usar este comando.' }, { quoted: msg });
//    return;
 // }

  const urlInput = args[0];
  if (!urlInput) {
    await sock.sendMessage(from, { text: '❌ Debes proporcionar la URL de Pornhub.' }, { quoted: msg });
    return;
  }

  try {
    await sock.sendMessage(from, { text: '🕒 Buscando video...' }, { quoted: msg });

    const ph = new PornHub();
    const video = await ph.video.getByUrl(urlInput);
    if (!video || !video.streamUrl) {
      await sock.sendMessage(from, { text: '❌ No se encontró enlace de descarga.' }, { quoted: msg });
      return;
    }

    const caption = `🎬 *${video.title}*\n📈 Views: ${video.views}\n🕓 Duración: ${video.duration}s`;

    await sock.sendMessage(from, { react: { text: '🕑', key: msg.key } });
    await sock.sendMessage(from, {
      video: { url: video.streamUrl },
      caption
    }, { quoted: msg });
    await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

  } catch (error) {
    console.error('❌ Error Pornhub API:', error);
    await sock.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: msg });
  }
}
