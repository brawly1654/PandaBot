import { enviarPeticionEspejo } from "../PandaLove/pizzeria.js";

export const command = 'solicitarespejo';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (args.length === 0) {
    await sock.sendMessage(from, { text: '❌ Debes especificar el ID de la pizzería a la que quieres enviar la petición.' });
    return;
  }

  const nuevoIdEspejo = parseInt(args[0]);
  if (isNaN(nuevoIdEspejo)) {
    await sock.sendMessage(from, { text: '❌ El ID de la pizzería debe ser un número válido.' });
    return;
  }

  const loadingMsg = await sock.sendMessage(from, { text: `⏳ Enviando petición a la pizzería con ID *${nuevoIdEspejo}*...` });

  try {
    const response = await enviarPeticionEspejo(sender, nuevoIdEspejo);

    if (response.number === 200) {
      await sock.sendMessage(from, { text: `✅ ¡Petición enviada exitosamente!` }, { quoted: loadingMsg });
    } else if (response.number === 404) {
      await sock.sendMessage(from, { text: `*❌ Error: ${response.error || 'Pizzería no encontrada'}.*` }, { quoted: loadingMsg });
    } else {
      await sock.sendMessage(from, { text: `*❌ Error al enviar la petición: ${response.message || 'Error desconocido'}.*` }, { quoted: loadingMsg });
    }

  } catch (error) {
    console.error('❌ Error al conectar con la API de la pizzería:', error);
    await sock.sendMessage(from, { text: `*❌ Hubo un error de conexión con la API de la pizzería. Inténtalo más tarde.*` });
  }
}

