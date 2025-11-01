import { ownerNumber } from '../config.js';

export const command = 'demoteall';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  const isOwner = ownerNumber.includes(`+${sender.split('@')[0]}`);
  if (!isOwner) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para los dueños del bot.' });
    return;
  }

  const isGroup = from.endsWith('@g.us');
  if (!isGroup) {
    await sock.sendMessage(from, { text: '❌ Este comando solo puede ser usado en grupos.' });
    return;
  }
  
  try {
    const metadata = await sock.groupMetadata(from);
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

    const adminsToDemote = metadata.participants
      .filter(p => p.admin !== null && p.id !== botId)
      .map(p => p.id);
    
    if (adminsToDemote.length === 0) {
        await sock.sendMessage(from, { text: '❌ No hay administradores para degradar en este grupo.' });
        return;
    }

    await sock.groupParticipantsUpdate(from, adminsToDemote, 'demote');
    await sock.sendMessage(from, { text: `✅ Todos los administradores han sido degradados.`, mentions: adminsToDemote });

  } catch (e) {
    console.error('❌ Error en demoteall:', e);
    await sock.sendMessage(from, { text: '❌ Error al degradar a todos los administradores. Asegúrate de que el bot sea superadmin.' });
  }
}

