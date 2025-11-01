import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'open';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const db = cargarDatabase();
  db.users = db.users || {};
  const user = db.users[sender];

  if (!user || !user.inventario?.includes("Spooky Lucky Block")) {
    await sock.sendMessage(from, { text: '❌ No tienes Lucky Blocks para abrir.' });
    return;
  }

  user.inventario.splice(user.inventario.indexOf("Spooky Lucky Block"), 1);

  const posibles = [
    ["The Spooky PandaBot", 60],
    ["Spooky Zeus", 10],
    ["Spooky Lukas", 10],
    ["Spooky Nyan Cat", 10],
    ["Spooky El Anti-Cristo", 5],
    ["Spooky 67", 4.5],
    ["Spooky Everything", 0.5]
  ];

  function elegir() {
    let r = Math.random() * 100;
    for (let [nombre, p] of posibles) {
      if (r < p) return nombre;
      r -= p;
    }
  }

  const resultado = elegir();

  let mostrando = await sock.sendMessage(from, { text: `🎁 Abriendo...` });

  const anim = ["🎃","👻","🎃","👻","🎃","👻","💀"];

  for (let i = 0; i < anim.length; i++) {
    await new Promise(r => setTimeout(r, 500));
    await sock.sendMessage(from, { edit: mostrando.key, text: `🎁 Abriendo... ${anim[i]}` });
  }

  user.personajes.push(resultado);
  guardarDatabase(db);

  await sock.sendMessage(from, { edit: mostrando.key, text: `🎉 ¡Has obtenido a *${resultado}*!` });
}
