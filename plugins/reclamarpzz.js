import { reclamarCoins } from "../PandaLove/pizzeria.js";

export const command = 'reclamarpzz';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const loadingMsg = await sock.sendMessage(from, { text: `⏳ Reclamando ganancias de tu pizzería...` });

  try {
    const response = await reclamarCoins(sender);

    if (response.number !== 200) {
      await sock.sendMessage(from, { text: `*❌ Error al reclamar, asegúrate de tener una pizzeria registrada.${response.error}*` }, { quoted: loadingMsg });
      return;
    }

    const {
      coins_reclamados,
      actual_coins,
      propina,
      descuento_quitado
    } = response;

    const mensaje = `
*--- 💰 Ganancias Reclamadas 💰 ---*

*PizzaCoins Reclamadas:* ${coins_reclamados}
*Descuento por servicios:* ${descuento_quitado}
*¡Propina por Calidad!:* ${propina}
*Total Actual:* ${actual_coins}

✅ ¡Tus PizzaCoins han sido añadidas a tu cuenta!
`;

    await sock.sendMessage(from, { text: mensaje });

  } catch (error) {
    console.error('❌ Error al conectar con la API de la pizzería:', error);
    await sock.sendMessage(from, { text: `*❌ Hubo un error de conexión con la API de la pizzería. Inténtalo más tarde.*` });
  }
}
