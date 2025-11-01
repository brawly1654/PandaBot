import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'addvip';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  const owners = ['56953508566', '573023181375', '166164298780822', '5215538830665', '97027992080542', '267232999420158'];
  const isOwner = owners.includes(sender.split('@')[0]);

  if (!isOwner) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para los dueños del bot.' });
    return;
  }

  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mentionedJid) {
    await sock.sendMessage(from, { text: '❌ Debes mencionar a un usuario.' });
    return;
  }
  
  const duration = parseInt(args[0]);
  if (isNaN(duration) || duration <= 0) {
    await sock.sendMessage(from, { text: '❌ Uso: .addvip <horas> @usuario' });
    return;
  }

  const db = cargarDatabase();
  db.users = db.users || {};
  const user = db.users[mentionedJid] || {
    pandacoins: 0,
    personajes: [],
  };

  const expirationTime = Date.now() + duration * 60 * 60 * 1000;
  
  user.vip = true;
  user.vipExpiration = expirationTime;
  db.users[mentionedJid] = user;
  guardarDatabase(db);
  
  const expirationDate = new Date(expirationTime);
  const formattedDate = expirationDate.toLocaleString('es-ES', { timeZone: 'America/Santiago' });
  
  await sock.sendMessage(from, { 
    text: `✅ @${mentionedJid.split('@')[0]} ahora es un usuario VIP por ${duration} horas. Expira el ${formattedDate}.`, 
    mentions: [mentionedJid] 
  });
}

