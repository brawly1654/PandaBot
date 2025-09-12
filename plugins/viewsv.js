import { todosServicios } from "../PandaLove/pizzeria.js";

export const command = 'viewsv';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;

  const loadingMsg = await sock.sendMessage(from, { text: '⏳ Obteniendo la lista de servicios...' });

  try {
    const response = await todosServicios();
    
    // La API devuelve un objeto con la clave 'servicios' y un array.
    if (response.servicios && response.servicios.length > 0) {
      let listaServicios = `✨ *Servicios Disponibles:*\n\n`;
      response.servicios.forEach(s => {
        listaServicios += `• *${s.nombre}*\n`;
        listaServicios += `  - Descripción: ${s.descripcion}\n`;
        if (s.descuento) {
          listaServicios += `  - Descuento: ${s.descuento}%\n`;
        }
        if (s.upquality) {
          listaServicios += `  - Mejora de Calidad: ${s.upquality}\n`;
        }
        listaServicios += '\n';
      });

      await sock.sendMessage(from, { text: listaServicios }, { quoted: loadingMsg });
    } else {
      await sock.sendMessage(from, { text: '❌ No hay servicios disponibles en este momento.' }, { quoted: loadingMsg });
    }

  } catch (error) {
    console.error('❌ Error al conectar con la API de la pizzería:', error);
    await sock.sendMessage(from, { text: `*❌ Hubo un error de conexión con la API de la pizzería. Inténtalo más tarde.*` });
  }
}

