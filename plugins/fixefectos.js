import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

const owners = ['56953508566@s.whatsapp.net', '5492996271200@s.whatsapp.net', '573023181375@s.whatsapp.net', '166164298780822@lid', '5215538830665@s.whatsapp.net'];

export const command = 'fixefectos';

const efectosEmojis = {
    'Rainbow': '🌈',
    'Glitch': '👾',
    'Chile': '🌶️',
    'Chicle': '🍬',
    'Tacos': '🌮',
    'Araña': '🕷️',
    'Agua': '💧',
    'Empanadas': '🥟',
    'Sopaipillas': '🫓'
};

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!owners.includes(sender)) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para los dueños del bot.' });
    return;
  }
  
  await sock.sendMessage(from, { text: '⏳ Iniciando el proceso de corrección de efectos...' });
  
  try {
    const personajesData = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
    const personajes = personajesData.characters;
    let personajesActualizados = 0;

    for (const personaje of personajes) {
      if (personaje.efectos && personaje.efectos.length > 0) {
        const nombreOriginal = personaje.nombre.replace(/\s?\*.*\*$/, '');
        const efectosTexto = personaje.efectos.map(e => efectosEmojis[e]).join('');
        const nuevoNombre = `${nombreOriginal} *${efectosTexto}*`;
        if (personaje.nombre !== nuevoNombre) {
          personaje.nombre = nuevoNombre;
          personajesActualizados++;
        }
      }
    }
    
    fs.writeFileSync('./data/personajes.json', JSON.stringify({ characters: personajes }, null, 2));

    const db = cargarDatabase();
    let usuariosActualizados = 0;
    
    if (db.users) {
      for (const userId in db.users) {
        const user = db.users[userId];
        let userCharactersUpdated = false;
        
        user.personajes = user.personajes || [];
        for (let i = 0; i < user.personajes.length; i++) {
          const personajeNombreViejo = user.personajes[i];
          const personajeEncontrado = personajes.find(p => p.nombre === personajeNombreViejo);
          if (personajeEncontrado) {
            user.personajes[i] = personajeEncontrado.nombre;
            userCharactersUpdated = true;
          }
        }

        if (userCharactersUpdated) {
          usuariosActualizados++;
        }
      }
      guardarDatabase(db);
    }
    
    await sock.sendMessage(from, { text: `✅ Proceso completado. Se corrigieron *${personajesActualizados}* personajes y se actualizaron las colecciones de *${usuariosActualizados}* usuarios.` });

  } catch (error) {
    console.error('❌ Error en fixefectos:', error);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al intentar corregir los efectos.' });
  }
}

