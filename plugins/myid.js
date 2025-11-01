import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'myid';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const db = cargarDatabase();
  db.users = db.users || {};
  const user = db.users[sender];

  if (!user) {
    await sock.sendMessage(from, { text: '❌ No estás registrado. Usa el comando .minar para empezar.' });
    return;
  }

  if (!user.id) {
    await sock.sendMessage(from, { text: '⏳ Detectando IDs faltantes. Asignando IDs a todos los usuarios...' });

    let idCounter = 1;
    for (const jid in db.users) {
      if (!db.users[jid].id) {
        db.users[jid].id = idCounter++;
      }
    }
    guardarDatabase(db);
    
    await sock.sendMessage(from, { text: '✅ ¡Proceso completado! Se han asignado IDs a todos los usuarios.' });
  }

  await sock.sendMessage(from, { text: `Tu ID de usuario es: *${user.id}*` });
}

