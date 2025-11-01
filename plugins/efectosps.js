export const command = 'efectosps';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const imageUrl = 'http://localhost:8000/upload/file_0000000034d061f8a7a755cd2eebdbd6.png';

  const menuText = `
┣━━━━━━━━━━━━━━━━━━━┫
*GUÍA EFECTOS DE LOS PERSONAJES*❗


Estos son todos los efectos disponibles, o sea, se pueden encontrar en alguna compra que hagas de algún personaje.


1. Rainbow🌈:

Probabilidad: 0.025%
Multiplica por: 10

2. Glitch👾:

Probabilidad: 0.12%
Multiplica por: 8

3. Chile🇨🇱:

Probabilidad: 0.25%
Multiplica por: 6

4. Caramelo🍬(chicle):

Probabilidad: 0.5%
Multiplica por: 5

5. Tacos🌮:

Probabilidad: 0.75%
Multiplica por: 4

6. Araña🕷️:

Probabilidad: 1.25%
Multiplica por: 3

7. Completo/Hot dog🌭:

Probabilidad: 1.5%
Multiplica por: 5

8. Agua💧:

Probabilidad: 2.5%
Multiplica por: 1.5

9. Sopaipilla🫓:

Probabilidad: 1.5%
Multiplica por: 3.5

10. Sueño💤:

Probabilidad: 8%
Multiplica por: 0.5

11. Calavera💀:

Probabilidad: 2.5%
Multiplica por: 2
┣━━━━━━━━━━━━━━━━━━━┫
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
      text: '❌ Ocurrió un error al cargar el menú de Love. Intenta más tarde.',
    }, { quoted: msg });
  }
}

