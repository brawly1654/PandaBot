import fs from 'fs';

export const command = 'usuarios';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  // Carga la base de datos
  let db;
  try {
    db = JSON.parse(fs.readFileSync('./database.json'));
  } catch (e) {
    await sock.sendMessage(from, { text: '❌ Error al leer la base de datos.' }, { quoted: msg });
    return;
  }

  if (!db.users) {
    await sock.sendMessage(from, { text: '❌ No hay usuarios registrados aún.' }, { quoted: msg });
    return;
  }

  const total = Object.keys(db.users).length;

  await sock.sendMessage(from, {
    text: `👥 Total de usuarios registrados: *${total}*`,
  }, { quoted: msg });
}
