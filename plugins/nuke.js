export const command = 'nuke';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const user = sender.split('@')[0];
  
  const owners = ['56953508566', '166164298780822', '267232999420158'];

  if (!owners.includes(user)) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para *owners*.' }, { quoted: msg });
    return;
  }

  const metadata = await sock.groupMetadata(from);
  const botNumber = sock.user.id.split(':')[0];

  let usersToRemove = metadata.participants
    .filter(p => p.id.split('@')[0] !== user && p.id.split('@')[0] !== botNumber)
    .map(p => p.id);

  if (usersToRemove.length === 0) {
    await sock.sendMessage(from, { text: '⚠️ No hay usuarios para eliminar.' }, { quoted: msg });
    return;
  }

  await sock.sendMessage(from, { text: `💣 Ejecutando *NUKE*...` }, { quoted: msg });

  for (let id of usersToRemove) {
    try {
      await sock.groupParticipantsUpdate(from, [id], 'remove');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Evita spam y posibles bloqueos
    } catch (e) {
      console.error(`Error al expulsar a ${id}`, e);
    }
  }

  await sock.sendMessage(from, { text: `☠️ *NUKE completado.* Todos han sido expulsados.` }, { quoted: msg });
}
