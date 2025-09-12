import { comprarAsiento } from "../PandaLove/pizzeria.js";

export const command = 'comprarasiento';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const loadingMsg = await sock.sendMessage(from, { text: `⏳ Comprando un asiento para tu pizzería...` });

  try {
    const response = await comprarAsiento(sender);

    if (response.error) {
      await sock.sendMessage(from, { text: `*❌ Error al comprar el asiento: ${response.error}.*` }, { quoted: loadingMsg });
      return;
    }

    const { new_chairs, remaining_coins } = response;

    const mensaje = `
✅ ¡Has comprado un nuevo asiento!

*Asientos Totales:* ${new_chairs}
*PizzaCoins Restantes:* ${remaining_coins.toFixed(2)}
`;

    await sock.sendMessage(from, { text: mensaje });

  } catch (error) {
    console.error('❌ Error al conectar con la API de la pizzería:', error);
    await sock.sendMessage(from, { text: `*❌ Hubo un error de conexión con la API de la pizzería. Inténtalo más tarde.*` });
  }
}
