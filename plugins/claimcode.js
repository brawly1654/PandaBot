import fs from 'fs';
import { canjearFolio } from '../PandaLove/monetizar.js';
import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { addCoins } from '../PandaLove/pizzeria.js';

const personajesData = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = personajesData.characters;

export const command = 'claimcode';

export async function run(sock, msg, args) {
    if (!msg.message) return;
    if (args.length === 0) {
        await sock.sendMessage(msg.key.remoteJid, { text: '❌ Por favor, proporciona un código para canjear.' });
        return;
    }
    const sender = msg.key.participant || msg.key.remoteJid;
    const userId = sender.split('@')[0];
    const code = args[0];

    try {
        const response = await canjearFolio(sender, code);

        if (response.status_code === 200) {
            const db = cargarDatabase();
            db.users = db.users || {};
            const user = db.users[sender] || {
              pandacoins: 0, exp: 0, diamantes: 0, piedras: 0, carne: 0, pescado: 0, madera: 0, comida: 0, oro: 0, personajes: [], salud: 100
            };
            db.users[sender] = user;

            global.cmDB = global.cmDB || {};
            global.cmDB[userId] = global.cmDB[userId] || { spins: 0, coins: 0 };
            
            // --- Lógica para el contador de aportes ---
            user.adCount = (user.adCount || 0) + 1; // Contador personal
            db.monetization = db.monetization || {};
            db.monetization.adCount = (db.monetization.adCount || 0) + 1; // Contador total
            guardarDatabase(db);
            // --- Fin de la lógica ---

            const detalles = response.detalles;
            const recurso = detalles.recurso;
            const cantidad = detalles.cantidad;

            let mensajeRecompensa = '';

            if (recurso === 'personaje') {
                const personajeGanado = personajes[Math.floor(Math.random() * personajes.length)];
                user.personajes.push(personajeGanado.nombre);
                mensajeRecompensa = `🎁 ¡Has obtenido un personaje aleatorio: *${personajeGanado.nombre}*!`;
            } else if (recurso === 'pizzacoins') {
                const apiResponse = await addCoins(sender, cantidad);
                if (apiResponse.detail) {
                    mensajeRecompensa = `❌ Error de la API al añadir PizzaCoins: ${apiResponse.detail}`;
                } else {
                    mensajeRecompensa = `✅ ¡Código canjeado con éxito! Has ganado *${cantidad} PizzaCoins*`;
                }
            } else if (recurso === 'giros') {
                global.cmDB[userId].spins += cantidad;
                global.guardarCM();
                mensajeRecompensa = `✅ ¡Código canjeado con éxito! Has ganado *${cantidad} ${recurso}* en Coin Master!`;
           } else if (recurso === 'creditos') {
                global.cmDB[userId].creditos += cantidad;
                global.guardarCM();
                mensajeRecompensa = `✅ ¡Código canjeado con éxito! Has ganado *${cantidad} ${recurso}* en Coin Master!`;
            } else if (recurso === 'coins') {
                global.cmDB[userId].coins += cantidad;
                global.guardarCM();
                mensajeRecompensa = `✅ ¡Código canjeado con éxito! Has ganado *${cantidad} ${recurso}* en Coin Master!`;
            } else {
                if (user[recurso] === undefined) {
                  user[recurso] = 0;
                }
                user[recurso] += cantidad;
                mensajeRecompensa = `✅ ¡Código canjeado con éxito! Has ganado *${cantidad} ${recurso}*`;
            }
            
            await sock.sendMessage(msg.key.remoteJid, { text: mensajeRecompensa }, { quoted: msg });
        } else if (response.status_code === 404) {
            await sock.sendMessage(msg.key.remoteJid, { text: `❌ Código no válido.` }, { quoted: msg });
        } else if (response.status_code === 400) {
            await sock.sendMessage(msg.key.remoteJid, { text: `❌ Código ya canjeado.` }, { quoted: msg });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error al canjear el código.` }, { quoted: msg });
        }
    } catch (error) {
        console.error('Error en claimcode:', error);
        await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error al conectar con el servicio de monetización.` }, { quoted: msg });
    }
}

