import { getSuerteMultiplicador } from './activate.js';
import { cargarStock, guardarStock } from '../plugins/addstock.js';
import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { guardarPersonajes } from '../data/database.js';

const personajesData = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = personajesData.characters;

const itemsData = JSON.parse(fs.readFileSync('./data/items.json', 'utf8'));
const items = itemsData.items;
export const multiplicadores = {
  '🌈': 8, '👾': 5, '🇨🇱': 3, '🍬': 2, '🌮': 1.5, '🕷': 1.3,
  '💧': 1.1, '🫓': 1.5, '🌭': 2, '💤': 0.5, '💀': 1.5, '🚽': 14,
  '🇧🇷': 2, '🇨🇴': 2, '☯️': 2.5, '💩': 0.1, '🎃': 3
};
function contieneEfectoProhibido(nombrePersonaje) {
  const efectosProhibidos = Object.keys(multiplicadores);
  return efectosProhibidos.some(emoji => nombrePersonaje.includes(emoji));
}

export const command = 'buy';
export async function run(sock, msg, args) {
const suerte = getSuerteMultiplicador();
const probEfectos = {
  '🌈': 0.00012 * suerte, '👾': 0.0006 * suerte, '🇨🇱': 0.0012 * suerte,
  '🍬': 0.002 * suerte, '🌮': 0.0075 * suerte, '🕷': 0.0075 * suerte,
  '💧': 0.009 * suerte, '🌭': 0.0015 * suerte, '🫓': 0.0015 * suerte,
  '💤': 0.05, '💀': 0.0025 * suerte, '🚽': 0.00001 * suerte,
  '🇧🇷': 0.005 * suerte, '🇨🇴': 0.005 * suerte, '☯️': 0.005 * suerte,
  '💩': 0.001 * suerte, '🎃': 0.001 * suerte
};

  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const db = cargarDatabase();
  db.users = db.users || {};
  const user = db.users[sender] || {};

  if (!user) {
    await sock.sendMessage(from, { text: '❌ No estás registrado. Usa .minar para empezar.' });
    return;
  }

  const COOLDOWN_MS = 0 * 1000;
  const ahora = Date.now();
  const ultimoBuy = user.ultimoBuy || 0;

  if (ahora - ultimoBuy < COOLDOWN_MS) {
    const restante = COOLDOWN_MS - (ahora - ultimoBuy);
    const minutos = Math.floor(restante / 60000);
    const segundos = Math.floor((restante % 60000) / 1000);
    await sock.sendMessage(from, {
      text: `⏳ Debes esperar *${minutos}m ${segundos}s* antes de volver a comprar.`,
    }, { quoted: msg });
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

  // 🎃 Lucky Block con stock añadido
  if (nombreInput === 'spooky lucky block') {
    const price = 200000000;
    const stock = cargarStock();
    const nombreBase = 'spooky lucky block';

    // 🔹 Verificar si hay stock
    if (stock[nombreBase] !== undefined) {
      if (stock[nombreBase] <= 0) {
        await sock.sendMessage(from, { text: `❌ El 🎃 *Spooky Lucky Block* está agotado.` });
        return;
      }
    }

    // 🔹 Verificar fondos
    if (user.pandacoins < price) {
      await sock.sendMessage(from, { text: `❌ El *Spooky Lucky Block* cuesta ${price} pandacoins.` });
      return;
    }

    // 🔹 Restar stock
    if (stock[nombreBase] !== undefined) {
      stock[nombreBase]--;
      guardarStock(stock);
    }

    // 🔹 Restar monedas y guardar
    user.pandacoins -= price;
    user.inventario.push("Spooky Lucky Block");
    guardarDatabase(db);

    // 🔹 Animación de compra
    let texto = `Comprando 🎃 Spooky Lucky Block...\n`;
    const frames = ['🎃','👻','🕸','💀','🕷','🎃','👻'];
    let i = 0;

    const m = await sock.sendMessage(from, { text: texto });

    const intervalo = setInterval(async () => {
      texto = `🛒 Comprando Spooky Lucky Block... ${frames[i]}`;
      i = (i + 1) % frames.length;
      await sock.sendMessage(from, { edit: m.key, text: texto });
    }, 350);

    setTimeout(async () => {
      clearInterval(intervalo);
      await sock.sendMessage(from, { edit: m.key, text: `✅ Compraste un 🎃 *Spooky Lucky Block*.\nUsa *.open Spooky Lucky Block* para abrirlo.` });
    }, 3500);

    return;
  }

  if (nombreInput === 'random') {
    const personaje = personajes[Math.floor(Math.random() * personajes.length)];
    if (!personaje) {
      await sock.sendMessage(from, { text: '❌ No se encontraron personajes en la lista.' });
      return;
    }
   
  if (contieneEfectoProhibido(personaje.nombre)) {
  await sock.sendMessage(from, {
    text: '❌ No está permitido comprar personajes con efectos de por sí.'
  }, { quoted: msg });
  return;
}
    const stock = cargarStock();
    const nombreBase = personaje.nombre.toLowerCase();
    if (stock[nombreBase] !== undefined) {
      if (stock[nombreBase] <= 0) {
        await sock.sendMessage(from, { text: `❌ El personaje *${personaje.nombre}* está agotado.` }, { quoted: msg });
        return;
      }
      stock[nombreBase]--;
      guardarStock(stock);
    }

    if (user.pandacoins < personaje.precio) {
      await sock.sendMessage(from, { text: `❌ No tienes suficientes pandacoins. El personaje *${personaje.nombre}* cuesta ${personaje.precio} pandacoins.` });
      return;
    }

    await sock.sendMessage(from, { text: `⏳ Comprando un personaje aleatorio, esto tardará unos segundos...` });
    await new Promise(resolve => setTimeout(resolve, 2));

    const { nombreFinal, personajeConEfectos, precioFinal } = aplicarEfectos(personaje);

    user.pandacoins -= personaje.precio;
    user.personajes.push(nombreFinal);
    user.ultimoBuy = ahora;
    guardarDatabase(db);

    if (personajeConEfectos) {
      personajes.push(personajeConEfectos);
      guardarPersonajes(personajes);
      await sock.sendMessage(from, {
        text: `✨ ¡Increíble! A tu *${personaje.nombre}* le cayeron los efectos *${personajeConEfectos.efectos.join(', ')}*! Su valor se multiplicó a *${precioFinal}* y ahora lo puedes vender por un precio mayor. *Obtendrás tu personaje cuando el Bot sea reiniciado*`
      });
    } else {
      await sock.sendMessage(from, { text: `🎉 ¡Felicidades! Compraste a *${personaje.nombre}* correctamente.` });
    }

    if (suerte > 1) {
      await sock.sendMessage(from, { react: { text: '🍀', key: msg.key } });
    }

  } else {
    const personaje = personajes.find(p => p.nombre.toLowerCase() === nombreInput);
    if (contieneEfectoProhibido(personaje.nombre)) {
  await sock.sendMessage(from, {
    text: '❌ No está permitido comprar personajes con efectos de por sí.'
  }, { quoted: msg });
  return;
}

    const item = items.find(i => i.nombre.toLowerCase() === nombreInput);

    if (personaje) {
      const stock = cargarStock();
      const nombreBase = personaje.nombre.toLowerCase();
      if (stock[nombreBase] !== undefined) {
        if (stock[nombreBase] <= 0) {
          await sock.sendMessage(from, { text: `❌ El personaje *${personaje.nombre}* está agotado.` }, { quoted: msg });
          return;
        }
        stock[nombreBase]--;
        guardarStock(stock);
      }

      if (user.pandacoins < personaje.precio) {
        await sock.sendMessage(from, { text: `❌ No tienes suficientes pandacoins. El personaje *${personaje.nombre}* cuesta ${personaje.precio} pandacoins.` });
        return;
      }

      await sock.sendMessage(from, { text: `⏳ Comprando a *${personaje.nombre}*, esto tardará unos segundos...` });
      await new Promise(resolve => setTimeout(resolve, 2));

      const { nombreFinal, personajeConEfectos, precioFinal } = aplicarEfectos(personaje);

      user.pandacoins -= personaje.precio;
      user.personajes.push(nombreFinal);
      user.ultimoBuy = ahora;
      guardarDatabase(db);

      if (personajeConEfectos) {
        personajes.push(personajeConEfectos);
        guardarPersonajes(personajes);
        await sock.sendMessage(from, {
          text: `✨ ¡Increíble! A tu *${personaje.nombre}* le cayeron los efectos *${personajeConEfectos.efectos.join(', ')}*! Su valor se multiplicó a *${precioFinal}* y ahora lo puedes vender por un precio mayor. *Obtendrás tu personaje cuando el Bot sea reiniciado.*`
        });
      } else {
        await sock.sendMessage(from, { text: `🎉 ¡Felicidades! Compraste a *${personaje.nombre}* correctamente.` });
      }

      if (suerte > 1) {
        await sock.sendMessage(from, { react: { text: '🍀', key: msg.key } });
      }

    } else if (item) {
      if (user.pandacoins < item.precio) {
        await sock.sendMessage(from, { text: `❌ No tienes suficientes pandacoins. El objeto *${item.nombre}* cuesta ${item.precio} pandacoins.` });
        return;
      }

      user.pandacoins -= item.precio;
      user.inventario.push(item.nombre);
      user.ultimoBuy = ahora;
      guardarDatabase(db);
      await sock.sendMessage(from, { text: `✅ Compraste un *${item.nombre}* por ${item.precio} pandacoins.` });

    } else {
      await sock.sendMessage(from, { text: `❌ El personaje no se encontró. Usa .viewps para ver la lista de personajes disponibles.` });
    }
  }
}

function aplicarEfectos(personaje) {
    const efectos = [];
    let precioFinal = personaje.precio;
    const descripcionOriginal = personaje.descripcion;
    let nombreFinal = personaje.nombre;

const probEfectos = {
'🌈': 0.0012, '👾': 0.006, '🇨🇱': 0.001, '🍬': 0.02,
'🌮': 0.02, '🕷': 0.003, '💧': 0.03,
'🌭': 0.01, '🫓': 0.015, '💤': 0.03, '💀': 0.02,
'🚽': 0.0001, '🇧🇷': 0.005, '🇨🇴': 0.005, '☯️': 0.005,
'💩': 0.005,
};
const multiplicadores = {
  '🌈': 8, '👾': 5, '🇨🇱': 3, '🍬': 2, '🌮': 1.5, '🕷': 1.3,
  '💧': 1.1, '🫓': 1.5, '🌭': 2, '💤': 0.5, '💀': 1.5, '🚽': 14,
  '🇧🇷': 2, '🇨🇴': 2, '☯️': 2.5, '💩': 0.1, '🎃': 3
};
    for (const efecto in probEfectos) {
        if (Math.random() < probEfectos[efecto]) {
            efectos.push(efecto);
            precioFinal *= multiplicadores[efecto];
        }
    }

    if (efectos.length > 0) {
        const nuevoPersonaje = {
            nombre: `${nombreFinal} ${efectos.join(' ')}`,
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
