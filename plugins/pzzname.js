import { cambiarNombre } from "../PandaLove/pizzeria.js";

export const command = 'pzzname';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const nuevoNombre = args.join(' ');

  if (!nuevoNombre) {
    await sock.sendMessage(from, { text: '❌ Debes escribir el nuevo nombre para tu pizzería. Ejemplo: *.pzzname La Pizzería de Pepe*' });
    return;
  }

  const loadingMsg = await sock.sendMessage(from, { text: `⏳ Cambiando el nombre de tu pizzería a *${nuevoNombre}*...` });

  try {
    const response = await cambiarNombre(sender, nuevoNombre);

    if (response.detail) {
      await sock.sendMessage(from, { text: `*❌ Error al cambiar el nombre, asegúrate de tener una pizzeria registrada.*` }, { quoted: loadingMsg });
      return;
    }

    // La API devuelve un string en caso de éxito, según la imagen.
    await sock.sendMessage(from, { text: `✅ ¡El nombre de tu pizzería se ha cambiado con éxito!` }, { quoted: loadingMsg });

  } catch (error) {
    console.error('❌ Error al conectar con la API de la pizzería:', error);
    await sock.sendMessage(from, { text: `*❌ Hubo un error de conexión con la API de la pizzería. Inténtalo más tarde.*` });
  }
}

