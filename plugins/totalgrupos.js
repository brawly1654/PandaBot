import { ownerNumber } from '../config.js';

export const command = 'totalgrupos';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function run(sock, msg) {
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderId = sender.split('@')[0];

  if (!ownerNumber.includes(`+${senderId}`)) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: '❌ Este comando solo puede ser usado por los owners.'
    }, { quoted: msg });
    return;
  }

  const chats = await sock.groupFetchAllParticipating();
  const grupos = Object.values(chats);
  const loteSize = 15;
  const links = [];

  for (let i = 0; i < grupos.length; i += loteSize) {
    const lote = grupos.slice(i, i + loteSize);

    for (const grupo of lote) {
      try {
        const metadata = await sock.groupMetadata(grupo.id);
        if (metadata?.id && metadata?.inviteCode) {
          links.push(`• ${metadata.subject}: https://chat.whatsapp.com/${metadata.inviteCode}`);
        }
      } catch (e) {
        // El bot no tiene permisos para ver el link de este grupo
      }
    }

    // Espera 2 segundos entre cada lote
    await delay(2000);
  }

  if (links.length === 0) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: '📭 No se pudo obtener ningún link de grupo. Asegúrate de que el bot sea admin en al menos uno.'
    }, { quoted: msg });
    return;
  }

  const mensaje = `📊 *Grupos con acceso a link:*\n\n${links.join('\n')}`;
  await sock.sendMessage(msg.key.remoteJid, { text: mensaje }, { quoted: msg });
}
