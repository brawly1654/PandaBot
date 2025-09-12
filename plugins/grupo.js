import { ownerNumber } from '../config.js';

export const command = 'grupo';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  // Verificamos que esté en un grupo
  if (!from.endsWith('@g.us')) {
    await sock.sendMessage(from, { text: '❌ Este comando solo se puede usar en grupos.' });
    return;
  }

  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split('@')[0];
  const metadata = await sock.groupMetadata(from);

  const isAdmin = metadata.participants.some(p =>
    p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  );
  const isOwner = ownerNumber.includes(`+${senderNumber}`);

  if (!isAdmin && !isOwner) {
    await sock.sendMessage(from, { text: '❌ Solo los admins o el owner pueden usar este comando.' });
    return;
  }

  if (!args[0]) {
    await sock.sendMessage(from, { text: '⚠️ Usa:\n.grupo abrir\n.grupo cerrar' });
    return;
  }

  const accion = args[0].toLowerCase();

  try {
    if (accion === 'abrir') {
      await sock.groupSettingUpdate(from, 'not_announcement');
      await sock.sendMessage(from, { text: '✅ El grupo ha sido *abierto* para que todos puedan enviar mensajes.' });
    } else if (accion === 'cerrar') {
      await sock.groupSettingUpdate(from, 'announcement');
      await sock.sendMessage(from, { text: '✅ El grupo ha sido *cerrado* solo para admins.' });
    } else {
      await sock.sendMessage(from, { text: '⚠️ Opción inválida. Usa:\n.grupo abrir\n.grupo cerrar' });
    }
  } catch (e) {
    console.error('❌ Error al cambiar configuración del grupo:', e);
    await sock.sendMessage(from, { text: '⚠️ No pude cambiar la configuración. Asegúrate de que soy admin y tengo permisos.' });
  }
}
