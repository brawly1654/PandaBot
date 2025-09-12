import { contratarServicio, todosServicios } from "../PandaLove/pizzeria.js";

export const command = 'contratarsv';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  if (args.length === 0) {
    await sock.sendMessage(from, { text: '❌ Debes especificar el nombre del servicio que quieres contratar. Usa *.viewsv* para ver la lista.' });
    return;
  }

  const servicio = args.join(' ');

  // Validar si el servicio existe antes de contratar
  try {
    const serviciosDisponibles = await todosServicios();
    const existeServicio = serviciosDisponibles.servicios.some(s => s.nombre.toLowerCase() === servicio.toLowerCase());
    
    if (!existeServicio) {
      await sock.sendMessage(from, { text: `❌ El servicio *${servicio}* no está disponible. Usa *.viewsv* para ver la lista.` });
      return;
    }
  } catch (error) {
    await sock.sendMessage(from, { text: '❌ Hubo un error al validar los servicios disponibles.' });
    return;
  }

  const loadingMsg = await sock.sendMessage(from, { text: `⏳ Contratando el servicio *${servicio}*...` });

  try {
    const response = await contratarServicio(sender, servicio);

    if (response.number !== 200) {
      await sock.sendMessage(from, { text: `*❌ Error al contratar el servicio: ${response.error}.*` }, { quoted: loadingMsg });
      return;
    }

    await sock.sendMessage(from, { text: `✅ ¡Servicio *${servicio}* contratado con éxito!` }, { quoted: loadingMsg });

  } catch (error) {
    console.error('❌ Error al conectar con la API de la pizzería:', error);
    await sock.sendMessage(from, { text: `*❌ Hubo un error de conexión con la API de la pizzería. Inténtalo más tarde.*` });
  }
}
