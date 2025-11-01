import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

import { guardarPersonajes } from '../data/database.js';

const personajesData = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = personajesData.characters;

const itemsData = JSON.parse(fs.readFileSync('./data/items.json', 'utf8'));
const items = itemsData.items;

export const command = 'buy';

const probEfectos = {
    '🌈': 0.0005, '👾': 0.0025, '🇨🇱': 0.005, '🍬': 0.01, '🌮': 0.015, '🕷': 0.025, '💧': 0.05, '🫔': 0.05, '🫓': 0.05
};
const multiplicadores = {
    '🌈': 10, '👾': 8, '🇨🇱': 6, '🍬': 5, '🌮': 4, '🕷': 3, '💧': 1.5, '🫓': 3.5, '🫔': 5
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
  
  const personajeOriginal = personajes.find(p => p.nombre.toLowerCase() === nombreInput);

  if (personajeOriginal) {
    
    if (user.pandacoins < personajeOriginal.precio) {
        await sock.sendMessage(from, { text: `❌ No tienes suficientes pandacoins. El personaje *${personajeOriginal.nombre}* cuesta ${personajeOriginal.precio} pandacoins.` });
        return;
    }
    
    await sock.sendMessage(from, { text: `⏳ Comprando a *${personajeOriginal.nombre}*, esto tardará unos segundos...` });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { nombreFinal, personajeConEfectos, precioFinal } = aplicarEfectos(personajeOriginal, personajes, guardarPersonajes);
    
    user.pandacoins -= personajeOriginal.precio;
    user.personajes.push(nombreFinal);
    guardarDatabase(db);
    
    if (personajeConEfectos) {
        await sock.sendMessage(from, { text: `✨ ¡Increíble! A tu *${personajeOriginal.nombre}* le cayeron los efectos *${personajeConEfectos.efectos.join(', ')}*! Su valor se multiplicó a *${precioFinal}* y ahora lo puedes vender por un precio mayor.(.sell <personaje> <*efecto*>) *Obtendrás tu personaje cuando el Bot sea reiniciado.*` });
    } else {
        await sock.sendMessage(from, { text: `🎉 ¡Felicidades! Compraste a *${personajeOriginal.nombre}* correctamente. Pero no le cayó efecto :(` });
    }
  } else if (nombreInput === 'random') {
    const personajesDisponibles = personajes.filter(p => !Object.values(db.users).some(u => (u.personajes || []).includes(p.nombre)));

    if (personajesDisponibles.length === 0) {
      await sock.sendMessage(from, { text: '❌ Ya no quedan personajes disponibles para comprar.' });
      return;
    }

    const personaje = personajesDisponibles[Math.floor(Math.random() * personajesDisponibles.length)];
    
    if (user.pandacoins < personaje.precio) {
        await sock.sendMessage(from, { text: `❌ No tienes suficientes pandacoins. El personaje *${personaje.nombre}* cuesta ${personaje.precio} pandacoins.` });
        return;
    }

    await sock.sendMessage(from, { text: `⏳ Comprando un personaje aleatorio, esto tardará unos segundos...` });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { nombreFinal, personajeConEfectos, precioFinal } = aplicarEfectos(personaje, personajes, guardarPersonajes);

    user.pandacoins -= personaje.precio;
    user.personajes.push(nombreFinal);
    guardarDatabase(db);

    if (personajeConEfectos) {
        await sock.sendMessage(from, { text: `✨ ¡Increíble! A tu *${personaje.nombre}* le cayeron los efectos *${personajeConEfectos.efectos.join(', ')}*! Su valor se multiplicó a *${precioFinal}* y ahora lo puedes vender por un precio mayor.(.sell <personaje> <*efecto*>) *Obtendrás tu personaje cuando el Bot sea reiniciado.*` });
    } else {
        await sock.sendMessage(from, { text: `🎉 ¡Felicidades! Compraste a *${personaje.nombre}* correctamente. Pero no le cayó efecto :(` });
    }
  } else {
    const item = items.find(i => i.nombre.toLowerCase() === nombreInput);
    if (item) {
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

function aplicarEfectos(personaje, personajes, guardarPersonajes) {
    const efectos = [];
    let precioFinal = personaje.precio;
    const descripcionOriginal = personaje.descripcion;
    let nombreFinal = personaje.nombre;

    const probEfectos = {
        '🌈': 0.0005, '👾': 0.0025, '🇨🇱': 0.005, '🍬': 0.01, '🌮': 0.015, '🕷': 0.025, '💧': 0.05, '🫔': 0.05, '🫓': 0.05
    };
    const multiplicadores = {
        '🌈': 10, '👾': 8, '🇨🇱': 6, '🍬': 5, '🌮': 4, '🕷': 3, '💧': 1.5, '🫓': 3.5, '🫔': 5
    };

    for (const efecto in probEfectos) {
        if (Math.random() < probEfectos[efecto]) {
            efectos.push(efecto);
            precioFinal *= multiplicadores[efecto];
        }
    }
    
    if (efectos.length > 0) {
        const nombreConEfectos = `${nombreFinal} *${efectos.join(' ')}*`;
        const existe = personajes.find(p => p.nombre === nombreConEfectos);

        if (existe) {
          return { nombreFinal: existe.nombre, personajeConEfectos: null, precioFinal: existe.precio };
        } else {
          const nuevoPersonaje = {
              nombre: nombreConEfectos,
              calidad: personaje.calidad,
              precio: Math.floor(precioFinal),
              efectos: efectos,
              descripcion: descripcionOriginal
          };
          return { nombreFinal: nuevoPersonaje.nombre, personajeConEfectos: nuevoPersonaje, precioFinal: nuevoPersonaje.precio };
        }
    } else {
        return { nombreFinal: nombreFinal, personajeConEfectos: null, precioFinal: precioFinal };
    }
}
