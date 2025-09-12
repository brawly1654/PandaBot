import { subirNivel } from "../PandaLove/pizzeria.js";

export const command = 'lvlup';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const loadingMsg = await sock.sendMessage(from, { text: `⏳ Subiendo de nivel tu pizzería...` });

  try {
    const response = await subirNivel(sender);

    if (response.number === 400) {
      await sock.sendMessage(from, { text: `❌ No cumples con los requisitos para subir de nivel. Usa *.lvlpizzeria* para verlos.${response.error}`}, { quoted: loadingMsg });
      return;
    }

    if (response.error) {
      await sock.sendMessage(from, { text: `*❌ Error al subir de nivel: ${response.error}.*` }, { quoted: loadingMsg });
      return;
    }

    const { message, new_level, remaining_coins, next_level_info } = response;
    
    let successMessage = `
✅ *¡${message}*

*Nuevo Nivel:* ${new_level}
*PizzaCoins Restantes:* ${remaining_coins.toFixed(2)}
`;

    if (next_level_info) {
      successMessage += `
--- Información del Próximo Nivel ---
*Costo:* ${next_level_info.precio_siguiente_nivel}
*Asientos Máximos:* ${next_level_info.max_chairs}
*Calidad Mínima:* ${next_level_info.min_quality}
`;
    } else {
      successMessage += `
*¡Has alcanzado el nivel máximo!*
`;
    }

    await sock.sendMessage(from, { text: successMessage });

  } catch (error) {
    console.error('❌ Error al conectar con la API de la pizzería:', error);
    await sock.sendMessage(from, { text: `*❌ Hubo un error de conexión con la API de la pizzería. Inténtalo más tarde.*` });
  }
}
