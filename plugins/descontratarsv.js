import { descontratarServicio } from "../PandaLove/pizzeria.js";

export const command = 'descontratarsv';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (args.length === 0) {
    await sock.sendMessage(from, { text: '❌ Debes especificar el nombre del servicio que quieres descontratar. Usa *.misv* para ver la lista de tus servicios.' });
    return;
  }

  const servicio = args.join(' ');

  const loadingMsg = await sock.sendMessage(from, { text: `⏳ Descontratando el servicio *${servicio}*...` });

  try {
    const response = await descontratarServicio(sender, servicio);

    if (response.number === 400) {
      await sock.sendMessage(from, { text: '🚫 No tienes este servicio.' }, { quoted: loadingMsg });
      return;
    }

    if (response.number === 405) { // Lógica que pediste
      await sock.sendMessage(from, { text: '❌ Servicio no encontrado.' }, { quoted: loadingMsg });
      return;
    }

    if (response.detail) {
      await sock.sendMessage(from, { text: `*❌ Error al descontratar el servicio: ${response.detail}.*` }, { quoted: loadingMsg });
      return;
    }

    await sock.sendMessage(from, { text: `✅ ¡Servicio descontratado con éxito!` }, { quoted: loadingMsg });

  } catch (error) {
    console.error('❌ Error al conectar con la API de la pizzería:', error);
    await sock.sendMessage(from, { text: `*❌ Hubo un error de conexión con la API de la pizzería. Inténtalo más tarde.*` });
  }
}

