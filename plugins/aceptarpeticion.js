import { aceptarPeticionEspejo } from "../PandaLove/pizzeria.js";

export const command = 'aceptarpeticion';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (args.length === 0) {
    await sock.sendMessage(from, { text: '❌ Debes especificar el ID de la petición que quieres aceptar.' });
    return;
  }

  const id_peticion = parseInt(args[0]);
  if (isNaN(id_peticion)) {
    await sock.sendMessage(from, { text: '❌ El ID de la petición debe ser un número válido.' });
    return;
  }

  const loadingMsg = await sock.sendMessage(from, { text: `⏳ Aceptando la petición con ID *${id_peticion}*...` });

  try {
    const response = await aceptarPeticionEspejo(sender, id_peticion);

    if (response.number === 200) {
      await sock.sendMessage(from, { text: `✅ ¡Petición aceptada exitosamente!` }, { quoted: loadingMsg });
    } else if (response.number === 404) {
      await sock.sendMessage(from, { text: `*❌ Error: ${response.error || 'Petición no encontrada'}.*` }, { quoted: loadingMsg });
    } else {
      await sock.sendMessage(from, { text: `*❌ Error al aceptar la petición: ${response.message || 'Error desconocido'}.*` }, { quoted: loadingMsg });
    }

  } catch (error) {
    console.error('❌ Error al conectar con la API de la pizzería:', error);
    await sock.sendMessage(from, { text: `*❌ Hubo un error de conexión con la API de la pizzería. Inténtalo más tarde.*` });
  }
}

