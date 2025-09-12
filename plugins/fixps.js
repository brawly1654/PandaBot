import fs from 'fs';
import path from 'path';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'fixps';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  // Array de dueños del bot (ajusta los números aquí)
  const owners = ['56953508566', '573023181375', '166164298780822'];
  const isOwner = owners.includes(sender.split('@')[0]);

  if (!isOwner) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para los dueños del bot.' });
    return;
  }

  await sock.sendMessage(from, { text: '⏳ Limpiando nombres de personajes en la base de datos...' });

  try {
    // Paso 1: Limpiar personajes.json
    const personajesFilePath = path.resolve('./data/personajes.json');
    if (fs.existsSync(personajesFilePath)) {
      const fileContent = fs.readFileSync(personajesFilePath, 'utf8');
      const data = JSON.parse(fileContent);

      data.characters.forEach(p => {
        p.nombre = p.nombre.replace(/_/g, ' ');
      });

      fs.writeFileSync(personajesFilePath, JSON.stringify(data, null, 2));
    }

    // Paso 2: Limpiar database.json (inventarios de usuarios)
    const db = cargarDatabase();
    for (const userId in db.users) {
      if (db.users[userId].personajes && Array.isArray(db.users[userId].personajes)) {
        db.users[userId].personajes = db.users[userId].personajes.map(pName => {
          if (typeof pName === 'string') {
            return pName.replace(/_/g, ' ');
          }
          return pName;
        });
      }
    }
    guardarDatabase(db);
    
    await sock.sendMessage(from, { text: '✅ ¡Proceso completado! Todos los guiones bajos han sido reemplazados por espacios tanto en la lista maestra de personajes como en los inventarios de los usuarios.' });

  } catch (error) {
    console.error('❌ Error en el comando fixps:', error);
    await sock.sendMessage(from, { text: `❌ Hubo un error al procesar los archivos. Revisa los logs.` });
  }
}

