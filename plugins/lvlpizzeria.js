import { obtenerNivel } from "../PandaLove/pizzeria.js";

export const command = 'lvlpizzeria';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const loadingMsg = await sock.sendMessage(from, { text: `⏳ Obteniendo el nivel de tu pizzería...` });

  try {
    const response = await obtenerNivel(sender);

    if (response.detail) {
      await sock.sendMessage(from, { text: `*❌ Error al obtener el nivel: ${response.detail}.*` }, { quoted: loadingMsg });
      return;
    }

    // Usar el objeto de respuesta si es un objeto simple, o el objeto anidado si existe
    const data = response.pizzeria || response;

    // Verificar si las claves esperadas existen en el objeto
    if (!data.nivel_actual || !data.titulo_nivel) {
      console.error('❌ La API no devolvió los datos esperados:', data);
      await sock.sendMessage(from, { text: '❌ La API devolvió un formato de datos inesperado.' }, { quoted: loadingMsg });
      return;
    }
    
    const {
      nivel_actual,
      titulo_nivel,
      precio_siguiente_nivel,
      max_chairs,
      chair_price,
      min_quality
    } = data;

    const mensaje = `
*--- 📈 Nivel de tu Pizzería 📈 ---*

*Nivel Actual:* ${nivel_actual}
*Título de Nivel:* ${titulo_nivel}
*Costo del próximo nivel:* ${precio_siguiente_nivel || 'N/A'}
*Asientos Máximos:* ${max_chairs || 'N/A'}
*Precio por silla:* ${chair_price || 'N/A'}
*Calidad Mínima requerida:* ${min_quality || 'N/A'}
`;

    await sock.sendMessage(from, { text: mensaje });

  } catch (error) {
    console.error('❌ Error al conectar con la API de la pizzería:', error);
    await sock.sendMessage(from, { text: `*❌ Hubo un error de conexión con la API de la pizzería. Inténtalo más tarde.*` });
  }
}

