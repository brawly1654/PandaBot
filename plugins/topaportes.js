import { cargarDatabase } from '../data/database.js';

export const command = 'topaportes';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const db = cargarDatabase();
  const users = Object.values(db.users || {});
  
  const topUsers = users
    .filter(u => u.adCount > 0)
    .sort((a, b) => b.adCount - a.adCount)
    .slice(0, 5);
    
  if (topUsers.length === 0) {
    await sock.sendMessage(from, { text: '📊 Aún no hay usuarios en el top de aportes.' });
    return;
  }
  
  let message = '🏆 *TOP 5 de Aportes (Anuncios Vistos)* 🏆\n\n';
  const mentions = [];
  
  topUsers.forEach((user, index) => {
    // Usamos el JID del usuario para la mención
    const userJid = Object.keys(db.users).find(key => db.users[key] === user);
    if (userJid) {
      message += `${index + 1}. @${userJid.split('@')[0]}: ${user.adCount} anuncios\n`;
      mentions.push(userJid);
    }
  });
  
  await sock.sendMessage(from, { text: message, mentions });
}

