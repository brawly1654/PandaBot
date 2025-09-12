import { cargarPetsDB, guardarPetsDB } from '../data/petsdb.js';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';

export const command = 'petimg';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const petsDB = cargarPetsDB();
  const pet = petsDB[sender];

  if (!pet) {
    await sock.sendMessage(from, { text: '❌ No tienes una mascota. Usa *.newpet* para conseguir una.' });
    return;
  }
  
  if (pet.propietario1 !== sender && pet.propietario2 !== sender) {
    await sock.sendMessage(from, { text: '❌ Solo un propietario de la mascota puede cambiar su imagen.' });
    return;
  }

  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quotedMsg || !quotedMsg.imageMessage) {
    await sock.sendMessage(from, { text: '❌ Debes citar una imagen para establecerla como foto de tu mascota.' });
    return;
  }
  
  const buffer = await downloadMediaMessage(quotedMsg, 'buffer');

  const petImagesDir = path.resolve('./data/pet_images');
  if (!fs.existsSync(petImagesDir)) {
      fs.mkdirSync(petImagesDir);
  }

  if (pet.imagePath && fs.existsSync(pet.imagePath)) {
    fs.unlinkSync(pet.imagePath);
  }

  const filePath = path.join(petImagesDir, `${pet.id}.jpeg`);
  fs.writeFileSync(filePath, buffer);
  
  pet.imagePath = filePath;
  guardarPetsDB(petsDB);

  await sock.sendMessage(from, { text: '✅ ¡Imagen de la mascota actualizada con éxito!' });
}

