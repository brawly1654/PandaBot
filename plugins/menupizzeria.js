export const command = 'menupizzeria';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const imageUrl = 'http://localhost:8000/upload/IMG-20250817-WA0709.jpg';

  const menuText = `
🍕 *MENÚ DE COMANDOS DE LA PIZZERÍA* 🍕

Número de soporte:

+52 55 3883 0665

¡Construye tu imperio de pizzas!

👨‍🍳 *Gestión de la Pizzería*
  • *.regpizzeria*
    > Registra tu pizzería para empezar a jugar.

  • *.mipizzeria*
    > Muestra toda la información de tu pizzería.

  • *.pzzname <nombre>*
    > Cambia el nombre de tu pizzería.

  • *.reclamarpzz*
    > Reclama las ganancias por hora de tu pizzería.

  • *.lvlup*
    > Mejora tu pizzería al siguiente nivel.

  • *.lvlpizzeria*
    > Muestra tu nivel de la pizzería actual.

  • *.comprarasiento* / *.comprarasientos*
    > Compra asientos para tu local.

🤝 *Comandos de Servicios y Espejos*
  • *.viewsv*
    > Muestra la lista de servicios disponibles.

  • *.contratarsv <servicio>*
    > Contrata un servicio para tu pizzería.

  • *.descontratarsv <servicio>*
    > Descontrata un servicio.

  • *.missv*
    > Muestra los servicios que tienes contratados.

  • *.solicitarespejo <id_pizzeria>*
    > Envía una petición de cuenta espejo a otra pizzería.

  • *.revisarpeticiones*
    > Revisa las peticiones de cuenta espejo que has recibido.

  • *.aceptarpeticion <id_peticion>*
    > Acepta una petición de cuenta espejo.

🏆 *Rankings*
  • *.toppizzerias*
    > Muestra el ranking de las mejores pizzerías.
`;

  try {
    await sock.sendMessage(from, {
      image: { url: imageUrl },
      caption: menuText.trim(),
      headerType: 4,
      externalAdReply: {
        title: 'Menú de la Pizzería',
        body: 'Comandos para gestionar tu local',
        mediaType: 1,
        thumbnailUrl: imageUrl,
      }
    }, { quoted: msg });
  } catch (error) {
    console.error('❌ Error enviando el menú de la pizzería:', error);
    await sock.sendMessage(from, {
      text: '❌ Ocurrió un error al cargar el menú de la pizzería. Intenta más tarde.',
    }, { quoted: msg });
  }
}

