import { obtenerPizzeria } from "../PandaLove/pizzeria.js";
export const command = "mipizzeria";

export async function run(sock, msg, args) {
    const sender = msg.key.participant || msg.key.remoteJid;
    const from = msg.key.remoteJid;
    await sock.sendMessage(from, { text: '⏳ Obteniendo datos de tu pizzería...' }, { quoted: msg });
    try {
        const response = await obtenerPizzeria(sender);
        if (response.error) {
            await sock.sendMessage(from, { text: `Error: ${response.error}` }, { quoted: msg });
            return;
        }
        const {
            id,
            id_whatsapp,
            nombre_pizzeria,
            local_level,
            coins_per_hour,
            chairs,
            coins,
            quality,
            imagen_pizzeria
        } = response;
        const mensaje = `
*--- 🍕 Mi Pizzería 🍕 ---*

*Nombre:* ${nombre_pizzeria}
*Número de Pizzeria:* ${id}
*Nivel:* ${local_level}
*PizzaCoins:* ${coins.toFixed(2)}
*Ganancias por hora:* ${coins_per_hour}
*Asientos:* ${chairs}
*Calidad:* ${quality}
`;
        await sock.sendMessage(from, {
      image: { url: imagen_pizzeria },
      caption: mensaje.trim(),
      headerType: 4,
      externalAdReply: {
        title: 'Tu pizzeria',
        body: 'Tu local',
        mediaType: 1,
        thumbnailUrl: imagen_pizzeria,
      }
    }, { quoted: msg });
    }
    catch(error) {
        await sock.sendMessage(from, { text: `Error: ${error}` });
    }
}
