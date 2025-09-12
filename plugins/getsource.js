import fs from 'fs';
import path from 'path';
import { crearFolio } from '../PandaLove/monetizar.js';

const API_KEY = "751b0c047ef1d83995f6e301a"

const RECURSOS_DISPONIBLES = {
  pandacoins: 500,
  exp: 100,
  piedra: 10,
  diamantes: 1,
  personaje: 'aleatorio'
};

export const command = 'getresource';

export async function run(sock, msg, args) {
    if (!msg.message) return;
    if (args.length === 0) {
        let listaRecursos = '💰 *Recursos disponibles para obtener:*\n\n';
        for (const recurso in RECURSOS_DISPONIBLES) {
            listaRecursos += `> ${recurso}\n`;
        }
        listaRecursos += '\n📌 Uso: *.getresource <recurso>*';
        await sock.sendMessage(msg.key.remoteJid, { text: listaRecursos }, { quoted: msg });
        return;
    }

    const recursoSolicitado = args[0].toLowerCase();
    if (!RECURSOS_DISPONIBLES[recursoSolicitado]) {
        await sock.sendMessage(msg.key.remoteJid, { text: `❌ El recurso '${recursoSolicitado}' no es válido.` }, { quoted: msg });
        return;
    }

    const sender = msg.key.participant || msg.key.remoteJid;

    try {
        const detalles = { 
            recurso: recursoSolicitado, 
            cantidad: RECURSOS_DISPONIBLES[recursoSolicitado] 
        };
        const response = await crearFolio(API_KEY, sender, detalles);
        
        if (!response.status_code) {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `✅ Recurso solicitado con éxito. Canjea tu recompensa aquí: ${response.link_monetizacion}` 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error al solicitar el recurso: ${response.response}` }, { quoted: msg });
        }
    } catch (error) {
        console.error('Error en getresource:', error);
        await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error al conectar con el servicio de monetización.` }, { quoted: msg });
    }
}

