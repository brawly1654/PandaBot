export const command = 'getlink';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  // Array de dueños del bot (¡ajusta los números aquí!)
  const owners = ['56953508566', '573023181375', '166164298780822']; // Ejemplo de números
  
  // Verificación de seguridad: solo los dueños del bot pueden usar este comando
  const isOwner = owners.includes(sender.split('@')[0]);
  if (!isOwner) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para los dueños del bot.' });
    return;
  }

  await sock.sendMessage(from, { text: '⏳ Obteniendo enlaces de todos los grupos...' });

  try {
    const groups = Object.values(await sock.groupFetchAllParticipating());
    const links = [];

    for (const group of groups) {
      try {
        const inviteCode = await sock.groupInviteCode(group.id);
        const link = `https://chat.whatsapp.com/${inviteCode}`;
        links.push({ name: group.subject, link: link });
      } catch (e) {
        console.error(`❌ No se pudo obtener el enlace para el grupo "${group.subject}". Razón: ${e.message}`);
      }
    }

    if (links.length > 0) {
      let message = '🔗 *Enlaces de los Grupos en los que está PandaBot:*\n\n';
      links.forEach(group => {
        message += `*• ${group.name}:*\n${group.link}\n\n`;
      });
      await sock.sendMessage(from, { text: message });
    } else {
      await sock.sendMessage(from, { text: '❌ No se pudo obtener ningún enlace de grupo.' });
    }

  } catch (error) {
    console.error('❌ Error en el comando getlink:', error);
    await sock.sendMessage(from, { text: '❌ Hubo un error inesperado al obtener los enlaces.' });
  }
}

