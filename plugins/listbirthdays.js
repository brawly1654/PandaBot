import { cargarDatabase } from '../data/database.js';

export const command = 'listbirthdays';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const db = cargarDatabase();

  const birthdayUsers = Object.keys(db.users)
    .filter(jid => db.users[jid].birthday)
    .map(jid => {
      return {
        jid: jid,
        birthday: db.users[jid].birthday
      };
    })
    .sort((a, b) => {
      const [dayA, monthA] = a.birthday.split('/').map(Number);
      const [dayB, monthB] = b.birthday.split('/').map(Number);
      if (monthA !== monthB) return monthA - monthB;
      return dayA - dayB;
    });

  if (birthdayUsers.length === 0) {
    await sock.sendMessage(from, { text: '❌ Aún no hay usuarios con un cumpleaños registrado.' });
    return;
  }

  let text = '🎂 *Lista de cumpleaños:*\n\n';
  const mentions = [];

  birthdayUsers.forEach(user => {
    text += `🎉 @${user.jid.split('@')[0]}: ${user.birthday}\n`;
    mentions.push(user.jid);
  });

  await sock.sendMessage(from, { text: text, mentions: mentions });
}

