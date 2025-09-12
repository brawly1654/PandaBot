import { topPizzerias } from "../PandaLove/pizzeria.js";

export const command = 'toppizzerias';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  const loadingMsg = await sock.sendMessage(from, { text: `⏳ Obteniendo el top de pizzerías...` });

  try {
    const response = await topPizzerias();

    if (response.number !== 200) {
      await sock.sendMessage(from, { text: `*❌ Error al obtener el top: ${response.message || 'Error desconocido'}.*` }, { quoted: loadingMsg });
      return;
    }

    const {
      top_coins,
      top_quality,
      top_level,
      top_chairs,
      top_coins_per_hour,
      top_oldest
    } = response;

    let message = '🏆 *RANKING DE PIZZERÍAS* 🏆\n\n';
    
    // Función para formatear cada top
    const formatTop = (title, list, valueKey, suffix = '') => {
      let text = `*${title}:*\n`;
      if (list && list.length > 0) {
        list.slice(0, 5).forEach((pizzeria, index) => {
          const value = (typeof pizzeria[valueKey] === 'number') ? pizzeria[valueKey].toFixed(2) : pizzeria[valueKey];
          text += `${index + 1}. *${pizzeria.nombre_pizzeria}* (${value} ${suffix})\n`;
        });
      } else {
        text += 'No hay datos disponibles.\n';
      }
      return text;
    };

    message += formatTop('🥇 TOP por PizzaCoins', top_coins, 'coins', 'PizzaCoins');
    message += '\n------------------------------\n\n';
    message += formatTop('⭐ TOP por Calidad', top_quality, 'quality', 'calidad');
    message += '\n------------------------------\n\n';
    message += formatTop('🚀 TOP por Nivel', top_level, 'local_level', 'nivel');
    message += '\n------------------------------\n\n';
    message += formatTop('🪑 TOP por Asientos', top_chairs, 'chairs', 'asientos');
    message += '\n------------------------------\n\n';
    message += formatTop('💰 TOP por Ganancias/h', top_coins_per_hour, 'coins_per_hour', 'coins/h');
    message += '\n------------------------------\n\n';
    
    // Top por antigüedad (fecha de registro)
    message += '*🕰️ TOP por Antigüedad:*\n';
    if (top_oldest && top_oldest.length > 0) {
      top_oldest.slice(0, 5).forEach((pizzeria, index) => {
        const registrationDate = new Date(pizzeria.last_claim).toLocaleDateString();
        message += `${index + 1}. *${pizzeria.nombre_pizzeria}*\n`;
      });
    } else {
      message += 'No hay datos disponibles.\n';
    }

    await sock.sendMessage(from, { text: message });

  } catch (error) {
    console.error('❌ Error al conectar con la API de la pizzería:', error);
    await sock.sendMessage(from, { text: `*❌ Hubo un error de conexión con la API de la pizzería. Inténtalo más tarde.*` });
  }
}

