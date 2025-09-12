import { cargarPetsDB } from '../data/petsdb.js';
import fs from 'fs';

export const command = 'mypet';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const petsDB = cargarPetsDB();
  const pet = petsDB[sender];

  if (!pet) {
    await sock.sendMessage(from, { text: '❌ No tienes una mascota. Usa *.newpet* para conseguir una.' });
    return;
  }
  
  const now = Date.now();
  const petAgeMs = now - pet.fechaNacimiento;
  const petAgeDays = Math.floor(petAgeMs / (1000 * 60 * 60 * 24));
  
  let owners = [`@${pet.propietario1.split('@')[0]}`];
  let mentions = [pet.propietario1];
  if (pet.propietario2) {
      owners.push(`@${pet.propietario2.split('@')[0]}`);
      mentions.push(pet.propietario2);
  }

  const caption = `
🐾 *Perfil de tu mascota* 🐾
---------------------------
*Nombre:* ${pet.nombre || 'Sin nombre'}
*Especie:* ${pet.especie}
*Edad:* ${petAgeDays} días
*Dueños:* ${owners.join(' y ')}

❤️ *Vida:* ${pet.vida}
🍔 *Hambre:* ${pet.hambre}
😊 *Felicidad:* ${pet.felicidad}
`;
  
  if (pet.imagePath && fs.existsSync(pet.imagePath)) {
    const imageBuffer = fs.readFileSync(pet.imagePath);
    await sock.sendMessage(from, { image: imageBuffer, caption: caption, mentions });
  } else {
    await sock.sendMessage(from, { text: caption, mentions });
  }
}

