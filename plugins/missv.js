import { misServicios } from "../PandaLove/pizzeria.js";

export const command = 'missv';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const loadingMsg = await sock.sendMessage(from, { text: '⏳ Obteniendo tus servicios...' });

  try {
    const response = await misServicios(sender);

    if (response.detail) {
      await sock.sendMessage(from, { text: `*❌ Error al obtener tus servicios: ${response.detail}.*` }, { quoted: loadingMsg });
      return;
    }

    const servicios = response.servicios_contratados; // La respuesta es un objeto con esta clave
    
    if (servicios.length === 0) {
      await sock.sendMessage(from, { text: '❌ No tienes servicios contratados aún.' }, { quoted: loadingMsg });
      return;
    }

    let listaServicios = `✨ *Tus Servicios Contratados:*\n\n`;
    servicios.forEach(s => {
      listaServicios += `• *${s}*\n`;
    });

    await sock.sendMessage(from, { text: listaServicios }, { quoted: loadingMsg });

  } catch (error) {
    console.error('❌ Error al conectar con la API de la pizzería:', error);
    await sock.sendMessage(from, { text: `*❌ ASEGURATE DE TENER SERVICIOS CONTRATADOS.*` });
  }
}

