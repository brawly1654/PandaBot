import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

import { guardarPersonajes } from '../data/database.js';

const personajesData = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = personajesData.characters;

const itemsData = JSON.parse(fs.readFileSync('./data/items.json', 'utf8'));
const items = itemsData.items;

export const command = 'buy';

const probEfectos = {
    'Rainbow': 0.001, 'Glitch': 0.005, 'Lava': 0.01, 'Chicle': 0.02, 'Tacos': 0.03, 'Araña': 0.05
};
const multiplicadores = {
    'Rainbow': 10, 'Glitch': 8, 'Lava': 6, 'Chicle': 5, 'Tacos': 4, 'Araña': 3
};

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const db = cargarDatabase();
  db.users = db.users || {};
  const user = db.users[sender] || {};

  if (!user) {
    await sock.sendMessage(from, { text: '❌ No estás registrado. Usa .minar para empezar.' });
    return;
  }

  user.pandacoins = user.pandacoins || 0;
  user.personajes = user.personajes || [];
  user.inventario = user.inventario || [];

  if (args.length === 0) {
    await sock.sendMessage(from, { text: '❌ Usa .buy <Nombre> o .buy random para comprar.' });
    return;
  }

  const nombreInput = args.join(' ').toLowerCase();
  
  if (nombreInput === 'random') {
    const personaje = personajes[Math.floor(Math.random() * personajes.length)];

    if (!personaje) {
        await sock.sendMessage(from, { text: '❌ No se encontraron personajes en la lista.' });
        return;
    }

    if (user.pandacoins < personaje.precio) {
        await sock.sendMessage(from, { text: `❌ No tienes suficientes pandacoins. El personaje *${personaje.nombre}* cuesta ${personaje.precio} pandacoins.` });
        return;
    }

    await sock.sendMessage(from, { text: `⏳ Comprando un personaje aleatorio, esto tardará 5 segundos...` });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const { nombreFinal, personajeConEfectos, precioFinal } = aplicarEfectos(personaje);
    
    user.pandacoins -= personaje.precio;
    user.personajes.push(nombreFinal);
    guardarDatabase(db);
    
    if (personajeConEfectos) {
        personajes.push(personajeConEfectos);
        guardarPersonajes(personajes);
        await sock.sendMessage(from, { text: `✨ ¡Increíble! A tu *${personaje.nombre}* le cayeron los efectos *${personajeConEfectos.efectos.join(', ')}*! Su valor se multiplicó a *${precioFinal}* y ahora lo puedes vender por un precio mayor.(.sell <personaje> <*efecto*>)n\*Obtendrás tu personaje cuando el Bot sea reiniciado*` });
    } else {
        await sock.sendMessage(from, { text: `🎉 ¡Felicidades! Compraste a *${personaje.nombre}* correctamente. Pero no le cayó efecto :(` });
    }

  } else {

    const personaje = personajes.find(p => p.nombre.toLowerCase() === nombreInput);
    const item = items.find(i => i.nombre.toLowerCase() === nombreInput);

    if (personaje) {
      if (user.pandacoins < personaje.precio) {
        await sock.sendMessage(from, { text: `❌ No tienes suficientes pandacoins. El personaje *${personaje.nombre}* cuesta ${personaje.precio} pandacoins.` });
        return;
      }
      
      await sock.sendMessage(from, { text: `⏳ Comprando a *${personaje.nombre}*, esto tardará 5 segundos...` });
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const { nombreFinal, personajeConEfectos, precioFinal } = aplicarEfectos(personaje);

      user.pandacoins -= personaje.precio;
      user.personajes.push(nombreFinal);
      guardarDatabase(db);

      if (personajeConEfectos) {
          personajes.push(personajeConEfectos);
          guardarPersonajes(personajes);
          await sock.sendMessage(from, { text: `✨ ¡Increíble! A tu *${personaje.nombre}* le cayeron los efectos *${personajeConEfectos.efectos.join(', ')}*! Su valor se multiplicó a *${precioFinal}* y ahora lo puedes vender por un precio mayor.(.sell <personaje> <*efecto*>) *Obtendrás tu personaje cuando el Bot sea reiniciado.*` });
      } else {
          await sock.sendMessage(from, { text: `🎉 ¡Felicidades! Compraste a *${personaje.nombre}* correctamente. Pero no le cayó efecto :(` });
      }

    } else if (item) {
        if (user.pandacoins < item.precio) {
            await sock.sendMessage(from, { text: `❌ No tienes suficientes pandacoins. El objeto *${item.nombre}* cuesta ${item.precio} pandacoins.` });
            return;
        }

        user.pandacoins -= item.precio;
        user.inventario.push(item.nombre);
        guardarDatabase(db);
        await sock.sendMessage(from, { text: `✅ Compraste un *${item.nombre}* por ${item.precio} pandacoins.` });

    } else {
        await sock.sendMessage(from, { text: `❌ Ni el personaje ni el objeto se encontraron. Usa .viewps o .shop para ver las listas.` });
    }
  }
}

function aplicarEfectos(personaje) {
    const efectos = [];
    let precioFinal = personaje.precio;
    const descripcionOriginal = personaje.descripcion;
    let nombreFinal = personaje.nombre;

    const probEfectos = {
        'Rainbow': 0.001, 'Glitch': 0.005, 'Lava': 0.01, 'Chicle': 0.02, 'Tacos': 0.03, 'Araña': 0.05
    };
    const multiplicadores = {
        'Rainbow': 10, 'Glitch': 8, 'Lava': 6, 'Chicle': 5, 'Tacos': 4, 'Araña': 3
    };

    for (const efecto in probEfectos) {
        if (Math.random() < probEfectos[efecto]) {
            efectos.push(efecto);
            precioFinal *= multiplicadores[efecto];
        }
    }
    
    if (efectos.length > 0) {
        const nuevoPersonaje = {
            nombre: `${nombreFinal} *${efectos.join('* *')}*`,
            calidad: personaje.calidad,
            precio: Math.floor(precioFinal),
            efectos: efectos,
            descripcion: descripcionOriginal
        };
        return { nombreFinal: nuevoPersonaje.nombre, personajeConEfectos: nuevoPersonaje, precioFinal: nuevoPersonaje.precio };
    } else {
        return { nombreFinal: nombreFinal, personajeConEfectos: null, precioFinal: precioFinal };
    }
}

