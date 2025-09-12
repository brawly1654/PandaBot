import { cargarPetsDB, guardarPetsDB } from '../data/petsdb.js';

export const command = 'petname';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const petsDB = cargarPetsDB();
  const pet = petsDB[sender];

  if (!pet) {
    await sock.sendMessage(from, { text: '❌ No tienes una mascota. Usa *.newpet* para conseguir una.' });
    return;
  }
  
  if (pet.propietario1 !== sender) {
    await sock.sendMessage(from, { text: '❌ Solo el propietario principal puede cambiar el nombre de la mascota.' });
    return;
  }

  const petName = args.join(' ');
  if (!petName) {
    await sock.sendMessage(from, { text: '❌ Debes dar un nombre a tu mascota. Ejemplo: *.petname Toby*' });
    return;
  }
  
  if (petName.length > 20) {
      await sock.sendMessage(from, { text: '❌ El nombre de la mascota no puede tener más de 20 caracteres.' });
      return;
  }

  pet.nombre = petName;
  guardarPetsDB(petsDB);

  await sock.sendMessage(from, { text: `✅ ¡Tu mascota ahora se llama *${petName}*!` });
}

