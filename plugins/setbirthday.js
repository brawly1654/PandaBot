import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'setbirthday';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const db = cargarDatabase();
  const user = db.users[sender];

  if (!user) {
    await sock.sendMessage(from, { text: '❌ No estás registrado. Usa el comando .minar para empezar.' });
    return;
  }
  
  if (user.birthday) {
      await sock.sendMessage(from, { text: '❌ Tu fecha de cumpleaños ya ha sido establecida y no se puede cambiar.' });
      return;
  }

  const birthday = args[0];
  if (!birthday || !/^\d{2}\/\d{2}$/.test(birthday)) {
    await sock.sendMessage(from, { text: '❌ Formato incorrecto. Usa DD/MM. Ejemplo: *.setbirthday 25/12*' });
    return;
  }

  const [day, month] = birthday.split('/').map(Number);
  if (day < 1 || day > 31 || month < 1 || month > 12) {
    await sock.sendMessage(from, { text: '❌ Fecha inválida. Asegúrate de que el día y el mes sean correctos.' });
    return;
  }

  user.birthday = birthday;
  guardarDatabase(db);

  await sock.sendMessage(from, { text: `🎉 ¡Tu fecha de cumpleaños ha sido guardada! Te avisaremos cuando sea tu día.` });
}

