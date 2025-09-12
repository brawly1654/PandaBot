import fs from 'fs';
import { cargarDatabase } from '../data/database.js';

export const command = 'cocinar';

const recetas = [
  { id: 1, nombre: 'Carne a la brasa', costo: { carne: 1, madera: 1 }, salud: 25 },
  { id: 2, nombre: 'Pescado frito', costo: { pescado: 1, madera: 1 }, salud: 20 },
  { id: 3, nombre: 'Carne y pescado a la leña', costo: { carne: 1, pescado: 1, madera: 2 }, salud: 50 },
];

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  const db = cargarDatabase();
  db.users = db.users || {};
  
  const user = db.users[sender] || { 
    pandacoins: 0, exp: 0, diamantes: 0, piedras: 0, carne: 0, pescado: 0, madera: 0, comida: 0, oro: 0, personajes: [], salud: 100 
  };
  db.users[sender] = user;
  
  if (args.length === 0) {
    let menu = '🍳 *Recetas Disponibles:*\n\n';
    recetas.forEach(receta => {
      const costo = Object.entries(receta.costo).map(([key, value]) => `${key}: ${value}`).join(', ');
      menu += `*${receta.id}.* ${receta.nombre}\n`;
      menu += `  - Costo: ${costo}\n`;
      menu += `  - Cura: ${receta.salud} salud\n\n`;
    });
    menu += '📌 Uso: *.cocinar <número_de_receta>*';
    await sock.sendMessage(from, { text: menu }, { quoted: msg });
    return;
  }

  const recetaId = parseInt(args[0]);
  const receta = recetas.find(r => r.id === recetaId);

  if (!receta) {
    await sock.sendMessage(from, { text: '❌ La receta no existe. Usa *.cocinar* para ver la lista.' }, { quoted: msg });
    return;
  }
  
  const tieneIngredientes = Object.entries(receta.costo).every(([ingrediente, cantidad]) => user[ingrediente] >= cantidad);

  if (!tieneIngredientes) {
    await sock.sendMessage(from, { text: `❌ No tienes suficientes ingredientes para "${receta.nombre}".` }, { quoted: msg });
    return;
  }

  Object.entries(receta.costo).forEach(([ingrediente, cantidad]) => user[ingrediente] -= cantidad);
  user.comida += 1;
  
  fs.writeFileSync('./data/database.json', JSON.stringify(db, null, 2));

  await sock.sendMessage(from, { text: `✅ ¡Cocinado! Ahora tienes 1 porción de ${receta.nombre}.` }, { quoted: msg });
}

