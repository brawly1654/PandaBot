export const command = 'menuimg';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;

  const menuImageUrl = 'http://localhost:8000/upload/bf2eff137f6c45b_file_00000000e1d0622f938e9510cbf93d5d_wm.png';

  const menuText = `
┏━━━━🖼️ *『 𝙋𝙖𝙣𝙙𝙖𝘽𝙤𝙩 』* 🖼️━━━━┓
  
✨ *Menú de Manipulación de Imágenes* ✨

Aplica efectos a una imagen respondiendo a ella con el comando.

🎨 *FILTROS & EFECTOS*

  • *.deepfry*
    > Aplica un efecto "deepfry" a una imagen.

  • *.magik*
    > Aplica un efecto "magik" a una imagen.

  • *.glitch*
    > Aplica un efecto de "glitch" a una imagen.

  • *.invert*
    > Invierte los colores de una imagen.

  • *.sepia*
    > Aplica un filtro sepia.

  • *.greyscale*
    > Convierte una imagen a escala de grises.

🖼️ *TRANSFORMACIONES*

  • *.circle*
    > Recorta una imagen en un círculo.

  • *.pixelate [nivel]*
    > Pixela una imagen (ej: *.pixelate 10*).

  • *.blur [nivel]*
    > Desenfoca una imagen (ej: *.blur 5*).
  
┣━━━━━━━━━━━━━━━━━━━┫
`;

  try {
    if (menuImageUrl === 'URL_DE_TU_IMAGEN_AQUÍ') {
      await sock.sendMessage(from, { text: menuText.trim() }, { quoted: msg });
      return;
    }

    await sock.sendMessage(from, {
      image: { url: menuImageUrl },
      caption: menuText.trim(),
      headerType: 4,
      externalAdReply: {
        title: 'Menú de Imágenes de PandaBot',
        body: 'Comandos para editar tus fotos',
        mediaType: 1,
        thumbnailUrl: menuImageUrl,
      }
    }, { quoted: msg });

  } catch (e) {
    console.error('❌ Error enviando el menú de imágenes:', e);
    await sock.sendMessage(from, {
      text: '❌ Ocurrió un error al cargar el menú de imágenes.',
    }, { quoted: msg });
  }
}

