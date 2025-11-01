import { cargarDatabase } from '../data/database.js';

export const command = 'sorteo';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const db = cargarDatabase();
  
  const allUsers = Object.keys(db.users || {});
  
  if (allUsers.length === 0) {
    await sock.sendMessage(from, { text: '❌ No hay usuarios registrados en el bot para hacer un sorteo.' });
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * allUsers.length);
  const winnerJid = allUsers[randomIndex];
  const winnerNumber = winnerJid.split('@')[0];
  
  await sock.sendMessage(from, {
    text: `🎉 ¡Y el ganador del sorteo es... *@${winnerNumber}*! ¡Felicidades!`,
    mentions: [winnerJid]
  });
}

