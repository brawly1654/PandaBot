import axios from 'axios';
import { ownerNumber } from '../config.js';

export const command = 'furry';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  // Opción: solo admins
  const isGroup = from.endsWith('@g.us');
  const metadata = isGroup ? await sock.groupMetadata(from) : null;
  const participants = isGroup ? metadata.participants : [];
  const adminList = isGroup ? participants.filter(p => p.admin).map(p => p.id) : [];
  const isAdmin = !isGroup || adminList.includes(sender) || ownerNumber.includes(sender.split('@')[0]);

  if (!isAdmin) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para administradores.' }, { quoted: msg });
    return;
  }

  try {
    const res = await axios.get("https://meme-api.com/gimme/Furryporn");
    const { url } = res.data;

    const caption = "*¿Si me pongo de perrito, me adoptas? 🔥🥴*";

    await sock.sendMessage(from, {
      image: { url },
      caption,
      buttons: [
        { buttonId: `!${command}`, buttonText: { displayText: '🥵 SIGUIENTE 🥵' }, type: 1 },
        { buttonId: `!labiblia`, buttonText: { displayText: '🔥 LABIBLIA 🔥' }, type: 1 }
      ],
      footer: '™𝓝𝓮𝓚𝓸𝓼𝓶𝓲𝓬 - 𝓑𝓞𝓣',
      mentions: [sender]
    }, { quoted: msg });
  } catch (err) {
    console.error(err);
    await sock.sendMessage(from, { text: '❌ No se pudo obtener la imagen. Intenta de nuevo.' }, { quoted: msg });
  }
}
