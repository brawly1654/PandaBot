import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { cargarPetsDB, guardarPetsDB } from '../data/petsdb.js';

export const command = 'alimentarpet';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const db = cargarDatabase();
  const user = db.users[sender] || {};
  const petsDB = cargarPetsDB();
  const pet = petsDB[sender];

  if (!pet) {
    await sock.sendMessage(from, { text: '❌ No tienes una mascota que alimentar.' });
    return;
  }
  
  const petAgeDays = Math.floor((Date.now() - pet.fechaNacimiento) / (1000 * 60 * 60 * 24));
  const costoAlimentar = 1000 + (petAgeDays * 10);

  if (user.pandacoins < costoAlimentar) {
    await sock.sendMessage(from, { text: `❌ No tienes suficientes pandacoins. Alimentar a tu mascota cuesta *${costoAlimentar}* pandacoins.` });
    return;
  }
  
  if (pet.hambre <= 0) {
    await sock.sendMessage(from, { text: '❌ Tu mascota no tiene hambre.' });
    return;
  }
  
  user.pandacoins -= costoAlimentar;
  pet.hambre = Math.max(0, pet.hambre - 25);
  pet.felicidad = Math.min(100, pet.felicidad + 10);

  guardarDatabase(db);
  guardarPetsDB(petsDB);

  await sock.sendMessage(from, { text: `✅ Le diste comida a *${pet.nombre || pet.especie}* por *${costoAlimentar}* pandacoins.\nSu hambre es de ${pet.hambre}.` });
}

