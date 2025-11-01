export const command = 'menulove';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const imageUrl = 'http://localhost:8000/upload/file_0000000034d061f8a7a755cd2eebdbd6.png';

  const menuText = `
┣━━━━━━━━━━━━━━━━━━━┫
*LOVE💗*

💗.pareja
> El bot muestra una pareja aleatoria del grupo.

💗.kiss @user

💗.sexo @user
> El bot muestra una animación de «sexo» con el usuario mencionado.

💗.ship @userA @userB
> El bot muestra la compatibilidad entre dos usuarios.

💗.marry @user
> Le propones matrimonio a la persona mencionada.

💗.aceptar
> Aceptas la propuesta de <.marry>.

💔.divorcio
> Te divorcias de la persona con la que estás casada.

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

