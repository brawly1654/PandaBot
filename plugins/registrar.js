import fs from 'fs/promises';

export const command = 'registrar';
const DB_PATH = './database.json';

async function loadDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveDB(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const senderRaw = msg.key.participant || msg.key.remoteJid;

  if (args.length < 2) {
    return await sock.sendMessage(from, { text: 'Uso: .registrar <nombre> <edad>' });
  }

  const nombre = args[0];
  const edad = Number(args[1]);

  if (isNaN(edad)) {
    return await sock.sendMessage(from, { text: 'La edad debe ser un número válido.' });
  }

  if (edad < 10 || edad > 25) {
    return await sock.sendMessage(from, { text: 'Usa tu edad real.🙏' });
  }

  const db = await loadDB();
  db.users = db.users || {};

  if (db.users[senderRaw]) {
    return await sock.sendMessage(from, { text: '❌ ¡Ya estás registrado!' });
  }

  db.users[senderRaw] = {
    nombre,
    edad,
    exp: 10,
    pandacoins: 1,
    personajes: []
  };

  await saveDB(db);

  await sock.sendMessage(from, { text: `✅ Registrado correctamente:\nNombre: ${nombre}\nEdad: ${edad}` });
}

