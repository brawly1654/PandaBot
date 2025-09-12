import { obtenerPeticionesEspejo } from "../PandaLove/pizzeria.js";

export const command = 'revisarpeticiones';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const loadingMsg = await sock.sendMessage(from, { text: `⏳ Obteniendo tus peticiones de cuenta espejo...` });

  try {
    const response = await obtenerPeticionesEspejo(sender);

    if (response.number === 200 && response.peticiones) {
      if (response.peticiones.length === 0) {
        await sock.sendMessage(from, { text: '✅ No tienes peticiones pendientes de cuenta espejo.' }, { quoted: loadingMsg });
      } else {
        let mensaje = '✉️ *Peticiones Pendientes de Cuenta Espejo:*\n\n';
        const mentions = [];
        response.peticiones.forEach(p => {
          const userId = p.id_string.split('@')[0];
          mensaje += `*ID de Petición:* ${p.id}\n`;
          mensaje += `*Usuario:* @${userId}\n`;
          mensaje += `*Estado:* ${p.estado}\n\n`;
          mentions.push(p.id_string);
        });
        await sock.sendMessage(from, { text: mensaje, mentions: mentions }, { quoted: loadingMsg });
      }
    } else if (response.number === 404) {
      await sock.sendMessage(from, { text: `*❌ Error: ${response.error || 'No hay peticiones de cuenta espejo'}.*` }, { quoted: loadingMsg });
    } else {
      await sock.sendMessage(from, { text: `*❌ Error al obtener las peticiones: ${response.message || 'Error desconocido'}.*` }, { quoted: loadingMsg });
    }

  } catch (error) {
    console.error('❌ Error al conectar con la API de la pizzería:', error);
    await sock.sendMessage(from, { text: `*❌ Hubo un error de conexión con la API de la pizzería. Inténtalo más tarde.*` });
  }
}

