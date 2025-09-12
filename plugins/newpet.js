import { cargarPetsDB, guardarPetsDB } from '../data/petsdb.js';

export const command = 'newpet';

const especies = ['Perro', 'Gato', 'Dragón', 'Hamster', 'Panda', 'Zorro'];

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const petsDB = cargarPetsDB();
  const userHasPet = Object.values(petsDB).some(pet => pet.propietario1 === sender || pet.propietario2 === sender);

  if (userHasPet) {
    await sock.sendMessage(from, { text: '❌ Ya tienes una mascota. Usa *.petname* para ver su nombre o *.mypet* para ver sus estadísticas.' });
    return;
  }

  const especieAleatoria = especies[Math.floor(Math.random() * especies.length)];
  const pet = {
    id: `pet-${Date.now()}`,
    nombre: null,
    especie: especieAleatoria,
    vida: 100,
    hambre: 0,
    felicidad: 50,
    propietario1: sender,
    propietario2: null,
    fechaNacimiento: Date.now()
  };

  petsDB[sender] = pet;
  guardarPetsDB(petsDB);

  await sock.sendMessage(from, { text: `🎉 ¡Felicidades! Has conseguido una mascota. Es un(a) *${especieAleatoria}*.\n\nUsa *.petname <nombre>* para darle un nombre.` });
}

