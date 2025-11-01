import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'ahorcado';

const words = [
  'perro', 'pandabot', 'casa', 'comida', 'gato', 'whatsapp', 'ahorcado', 'tren',
  'bicicleta', 'tralalero', 'zorro', 'libro', 'pie', 'termux', 'palabra', 'suerte',
  'espacio', 'tierra', 'saturno', 'jupiter', 'chile', 'argentina', 'meteorito', 'luna',
  'exportar', 'importar', 'caballo', 'sopa', 'metro', 'kilometro'
];

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const db = cargarDatabase();
  db.juegos = db.juegos || {};
  db.juegos.ahorcado = db.juegos.ahorcado || {};
  db.juegos.ahorcado.victorias = db.juegos.ahorcado.victorias || {};

  const juegoActual = db.juegos.ahorcado[from] || null;

  // 🔹 Iniciar nueva partida
  if (args[0] === 'iniciar') {
    if (juegoActual && juegoActual.activo) {
      await sock.sendMessage(from, { text: '❌ Ya hay una partida de ahorcado en curso.' });
      return;
    }

    const palabra = words[Math.floor(Math.random() * words.length)];
    const palabraOculta = '_'.repeat(palabra.length);

    db.juegos.ahorcado[from] = {
      activo: true,
      palabra,
      adivinada: palabraOculta,
      intentos: 6,
      letrasUsadas: [],
    };

    guardarDatabase(db);
    await sock.sendMessage(from, {
      text: `🎲 ¡Adivina la palabra!\n\n${mostrarPalabra(palabraOculta)}\n\nIntentos restantes: 6`
    });
    return;
  }

  // 🔹 Validar si hay partida activa
  if (!juegoActual || !juegoActual.activo) {
    await sock.sendMessage(from, {
      text: '❌ No hay una partida de ahorcado activa. Usa *.ahorcado iniciar* para comenzar.'
    });
    return;
  }

  // 🔹 Validar letra enviada
  if (!args[0] || args[0].length !== 1 || !/^[a-zA-Z]$/.test(args[0])) {
    await sock.sendMessage(from, { text: '❌ Solo puedes enviar una letra a la vez.' });
    return;
  }

  const letra = args[0].toLowerCase();
  const { palabra, adivinada, intentos, letrasUsadas } = juegoActual;

  if (letrasUsadas.includes(letra)) {
    await sock.sendMessage(from, { text: `❌ Ya usaste la letra *${letra}*.` });
    return;
  }

  letrasUsadas.push(letra);

  // 🔹 Si la letra está en la palabra
  if (palabra.includes(letra)) {
    let nuevaPalabraAdivinada = '';
    for (let i = 0; i < palabra.length; i++) {
      nuevaPalabraAdivinada += (palabra[i] === letra ? letra : adivinada[i]);
    }
    juegoActual.adivinada = nuevaPalabraAdivinada;

    if (nuevaPalabraAdivinada === palabra) {
      db.juegos.ahorcado.victorias[sender] = (db.juegos.ahorcado.victorias[sender] || 0) + 1;
      await sock.sendMessage(from, { text: `🎉 ¡Felicidades! Adivinaste la palabra: *${palabra}*` });
      delete db.juegos.ahorcado[from];
      guardarDatabase(db);
    } else {
      await sock.sendMessage(from, {
        text: `✅ ¡Bien hecho!\n\n${mostrarPalabra(juegoActual.adivinada)}\n\nIntentos restantes: ${intentos}`
      });
      guardarDatabase(db);
    }
  } else {
    // 🔹 Si la letra no está en la palabra
    juegoActual.intentos--;

    if (juegoActual.intentos <= 0) {
      await sock.sendMessage(from, { text: `☠️ ¡Se acabaron los intentos! La palabra era: *${palabra}*` });
      delete db.juegos.ahorcado[from];
      guardarDatabase(db);
    } else {
      await sock.sendMessage(from, {
        text: `❌ Letra incorrecta. Te quedan ${juegoActual.intentos} intentos.\n\n${mostrarPalabra(juegoActual.adivinada)}`
      });
      guardarDatabase(db);
    }
  }
}

// 🔹 Función para mostrar la palabra en formato _ _ _ _
function mostrarPalabra(palabra) {
  return palabra.split('').join(' ');
}
