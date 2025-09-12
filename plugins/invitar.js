import { cargarPetsDB, guardarPetsDB } from '../data/petsdb.js';

export const command = 'invitar';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mentionedJid) {
    await sock.sendMessage(from, { text: '❌ Debes mencionar a la persona que quieres invitar.' });
    return;
  }
  
  const petsDB = cargarPetsDB();
  const pet = petsDB[sender];
  const invitedUserHasPet = Object.values(petsDB).some(pet => pet.propietario1 === mentionedJid || pet.propietario2 === mentionedJid);

  if (!pet) {
    await sock.sendMessage(from, { text: '❌ No tienes una mascota para invitar a alguien.' });
    return;
  }
  
  if (pet.propietario2) {
      await sock.sendMessage(from, { text: '❌ Tu mascota ya tiene un segundo dueño.' });
      return;
  }
  
  if (invitedUserHasPet) {
      await sock.sendMessage(from, { text: '❌ El usuario que mencionaste ya tiene una mascota.' });
      return;
  }
  
  await sock.sendMessage(mentionedJid, { text: `💖 ¡Hola! @${sender.split('@')[0]} te ha invitado a cuidar a su mascota *${pet.nombre}*.\n\nPara aceptar, responde con *.aceptarinvitacion*` }, { mentions: [sender] });
  await sock.sendMessage(from, { text: `✅ ¡Invitación enviada a @${mentionedJid.split('@')[0]}!` }, { mentions: [mentionedJid] });
}

