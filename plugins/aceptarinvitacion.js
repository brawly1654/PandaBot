import { cargarPetsDB, guardarPetsDB } from '../data/petsdb.js';

export const command = 'aceptarinvitacion';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  const petsDB = cargarPetsDB();
  
  const pet = Object.values(petsDB).find(p => p.propietario2 === null);

  if (!pet) {
    await sock.sendMessage(from, { text: '❌ No hay ninguna invitación pendiente para cuidar una mascota.' });
    return;
  }
  
  const owner = pet.propietario1;
  const ownerNumber = owner.split('@')[0];

  pet.propietario2 = sender;
  petsDB[owner].propietario2 = sender;
  guardarPetsDB(petsDB);

  await sock.sendMessage(from, { text: `🎉 ¡Felicidades! Ahora tú y @${ownerNumber} son co-propietarios de la mascota *${pet.nombre}*.\n\n` +
                                        `Usa *.mypet* para ver sus estadísticas.`, mentions: [owner] });
}

