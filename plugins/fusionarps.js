import { cargarDatabase, guardarDatabase, guardarPersonajes } from '../data/database.js';
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = data.characters;

export const command = 'fusionarps';

export async function run(sock, msg, args) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    const db = cargarDatabase();
    db.users = db.users || {};
    const user = db.users[sender];

    if (!user) {
        await sock.sendMessage(from, { text: '❌ No estás registrado. Usa .registrar para empezar.' });
        return;
    }

    if (!args.length || !args.join(' ').includes('|')) {
        await sock.sendMessage(from, { text: '❌ Uso: *.fusionarps nombre1 | nombre2*' });
        return;
    }

    const [nombre1, nombre2] = args.join(' ').split('|').map(a => a.trim().toLowerCase());

    user.personajes = user.personajes || [];

    const countP1 = user.personajes.filter(pName => pName.toLowerCase() === nombre1).length;
    const countP2 = user.personajes.filter(pName => pName.toLowerCase() === nombre2).length;

    if (nombre1 === nombre2 && countP1 < 2) {
        await sock.sendMessage(from, { text: `❌ Debes tener al menos 2 copias de *${nombre1}* para fusionarlas.` });
        return;
    }
    if (nombre1 !== nombre2 && (countP1 < 1 || countP2 < 1)) {
        await sock.sendMessage(from, { text: '❌ Debes tener ambos personajes para poder fusionarlos.' });
        return;
    }

    const p1data = personajes.find(p => p.nombre.toLowerCase() === nombre1);
    const p2data = personajes.find(p => p.nombre.toLowerCase() === nombre2);

    if (!p1data || !p2data) {
        await sock.sendMessage(from, { text: '❌ Uno o ambos personajes no existen en la lista maestra.' });
        return;
    }

    if (p1data.calidad !== p2data.calidad) {
        await sock.sendMessage(from, { text: '❌ Solo se pueden fusionar personajes de la misma rareza.' });
        return;
    }

    const precioFusion = Math.max(p1data.precio || 0, p2data.precio || 0);
    if (user.pandacoins < precioFusion) {
        await sock.sendMessage(from, { text: `❌ Necesitas ${precioFusion} pandacoins para fusionar estos personajes.` });
        return;
    }
    
    let nuevoNombre;
    if (p1data.nombre.split(' ').length > 1 || p2data.nombre.split(' ').length > 1) {
        const primeraParte = p1data.nombre.split(' ')[0];
        const segundaParte = p2data.nombre.split(' ')[1] || p2data.nombre;
        nuevoNombre = `${primeraParte} ${segundaParte}`;
    } else {
        const mitad1 = p1data.nombre.slice(0, Math.ceil(p1data.nombre.length / 2));
        const mitad2 = p2data.nombre.slice(Math.floor(p2data.nombre.length / 2));
        nuevoNombre = mitad1 + mitad2;
    }

    const nuevoPersonaje = {
        nombre: nuevoNombre,
        calidad: p1data.calidad,
        precio: precioFusion,
        descripcion: `Personaje fusionado de ${p1data.nombre} y ${p2data.nombre}`
    };

    personajes.push(nuevoPersonaje);
    guardarPersonajes(personajes);

    let personajesTemp = [...user.personajes];
    const index1 = personajesTemp.findIndex(pName => pName.toLowerCase() === nombre1);
    if (index1 !== -1) {
        personajesTemp.splice(index1, 1);
    }
    const index2 = personajesTemp.findIndex(pName => pName.toLowerCase() === nombre2);
    if (index2 !== -1) {
        personajesTemp.splice(index2, 1);
    }
    user.personajes = personajesTemp;

    user.personajes.push(nuevoNombre);
    user.pandacoins -= precioFusion;
    guardarDatabase(db);

    await sock.sendMessage(from, { text: `✨ Has fusionado a *${p1data.nombre}* y *${p2data.nombre}* para crear a *${nuevoNombre}* (Rareza: ${p1data.calidad}, Precio: ${precioFusion}).` });
}

