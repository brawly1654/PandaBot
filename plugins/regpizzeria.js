import { registrarPizzeria } from "../PandaLove/pizzeria.js";

export const command = 'regpizzeria';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const loadingMsg = await sock.sendMessage(from, { text: `🍕 Registrando tu pizzería...` });

  try {
    const response = await registrarPizzeria(sender);

    if (response.number === 200) {
      await sock.sendMessage(from, { text: `*✅ ¡Felicidades! Tu pizzería ha sido registrada con éxito. Asegúrate de usar .pzzname para darle un nombre a tu Pizzeria.*` }, { quoted: loadingMsg });
    } else {
      await sock.sendMessage(from, { text: `*Ya tienes una pizzería registrada.🐼*` }, { quoted: loadingMsg });
    }
  } catch (error) {
    console.error('❌ Error al conectar con la API de la pizzería:', error);
    await sock.sendMessage(from, { text: `*❌ Hubo un error de conexión con la API de la pizzería. Inténtalo más tarde.*` });
  }
}
