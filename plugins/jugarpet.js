import { cargarPetsDB, guardarPetsDB } from '../data/petsdb.js';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'jugarpet';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  const db = cargarDatabase();
  const user = db.users[sender];
  const petsDB = cargarPetsDB();
  const pet = petsDB[sender];

  if (!pet) {
    await sock.sendMessage(from, { text: '❌ No tienes una mascota para jugar.' });
    return;
  }
  
  user.cooldowns = user.cooldowns || {};
  const now = Date.now();
  const cooldownTime = 60 * 60 * 1000; // 1 hora
  
  if (now - (user.cooldowns.jugar || 0) < cooldownTime) {
      const timeLeft = cooldownTime - (now - (user.cooldowns.jugar || 0));
      const minutes = Math.floor(timeLeft / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      await sock.sendMessage(from, { text: `⏳ Debes esperar ${minutes}m ${seconds}s para volver a jugar.` });
      return;
  }

  pet.felicidad = Math.min(100, pet.felicidad + 20);
  pet.hambre = Math.min(100, pet.hambre + 5);

  user.cooldowns.jugar = now;
  guardarDatabase(db);
  guardarPetsDB(petsDB);

  await sock.sendMessage(from, { text: `⚽ Jugaste con *${pet.nombre || pet.especie}*. Su felicidad es de ${pet.felicidad}.` });
}

