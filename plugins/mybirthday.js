import { cargarDatabase } from '../data/database.js';
import { DateTime } from 'luxon';

export const command = 'mybirthday';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const db = cargarDatabase();
  const user = db.users[sender];

  if (!user?.birthday) {
    await sock.sendMessage(from, { text: '❌ No has guardado tu cumpleaños. Usa *.setbirthday DD/MM* para hacerlo.' });
    return;
  }

  const [day, month] = user.birthday.split('/').map(Number);
  
  const today = DateTime.now().setZone('America/Santiago');
  let nextBirthday = DateTime.fromObject({ day, month, year: today.year }).setZone('America/Santiago');
  
  if (nextBirthday < today) {
    nextBirthday = nextBirthday.plus({ years: 1 });
  }

  const diff = nextBirthday.diff(today, 'days').days;
  const daysLeft = Math.ceil(diff);

  if (daysLeft === 0) {
    await sock.sendMessage(from, { text: `🎉 ¡Feliz cumpleaños! Es hoy, ${user.birthday}.` });
  } else {
    await sock.sendMessage(from, { text: `Tu cumpleaños es el *${user.birthday}*.\nFaltan *${daysLeft}* día(s) para tu cumpleaños.` });
  }
}

