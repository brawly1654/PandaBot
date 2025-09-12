import fs from 'fs';
import { ownerNumber } from '../config.js';

export const command = 'disable';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const senderNumber = msg.key.participant 
    ? msg.key.participant.split('@')[0]
    : msg.key.remoteJid.split('@')[0];
  const isGroup = from.endsWith('@g.us');
  const isOwner = ownerNumber.includes(`+${senderNumber}`);

  const option = args[0]?.toLowerCase();
  if (!option) return sock.sendMessage(from, { text: '⚙️ Escribe qué función quieres deshabilitar: antilink / modoadmin / modoowner / grupos / chatsprivados' }, { quoted: msg });

  const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

  if (isGroup) {
    const metadata = await sock.groupMetadata(from);
    const isAdmin = metadata.participants.some(p => p.id.startsWith(senderNumber) && (p.admin === 'admin' || p.admin === 'superadmin'));
    if (!isOwner && !isAdmin) {
      return sock.sendMessage(from, { text: '❌ Solo el owner o los admins pueden usar este comando en grupos.' }, { quoted: msg });
    }

    config.groups[from] = config.groups[from] || { antilink: false, modoadmin: false, modoowner: false, grupos: true, chatsprivados: true };

    if (option === 'antilink' || option === 'modoadmin') {
      config.groups[from][option] = false;
    } else {
      return sock.sendMessage(from, { text: '❌ Esa opción solo puede desactivarse desde el chat privado del owner.' }, { quoted: msg });
    }

  } else {
    if (!isOwner) return sock.sendMessage(from, { text: '❌ Solo el owner puede usar este comando en privado.' }, { quoted: msg });

    config.global = config.global || { modoowner: false, grupos: true, chatsprivados: true, ownerNumber };
    if (option === 'modoowner' || option === 'grupos' || option === 'chatsprivados') {
      config.global[option] = false;
    } else {
      return sock.sendMessage(from, { text: '❌ Esa opción solo puede desactivarse desde un grupo.' }, { quoted: msg });
    }
  }

  fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
  await sock.sendMessage(from, { text: `✅ Función *${option}* deshabilitada.` }, { quoted: msg });
}
