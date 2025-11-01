import fs from 'fs';

export const command = 'menu';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    const pandaBotPhoto = 'http://localhost:8000/upload/file_0000000034d061f8a7a755cd2eebdbd6.png';
    const pandaChannel = 'https://whatsapp.com/channel/0029Vb6SmfeAojYpZCHYVf0R';

    const menu = `
┏━━━━🐼 *『 𝙋𝙖𝙣𝙙𝙖𝘽𝙤𝙩 』* 🐼━━━━┓
✨ *Canal Oficial:* ${pandaChannel}
🌸 *Versión:* 2.2
👥️ *Grupo Oficial:* https://chat.whatsapp.com/IrHQqHBP47Y4cINAzAhFWh?mode=ac_t
📦 *Página Web:* https://bio.site/PandaBot
📎 *Gmail:* pandabotcl@gmail.com
🐼 *Instagram: @Pandabot.2025*
📎 *Número:* +56 9 3926 9150
📽 *Imágen:* https://files.catbox.moe/n7av3y.png

Contactos de soporte de PandaBot:

+56 9 5350 8566
+52 55 3883 0665
+57 302 3181375
┣━━━━━━━━━━━━━━━━━━━┫
*AÑADE AL BOT A TU GRUPO🙌*

.addbot <aquí el enlace de tu grupo>

-El grupo, como mínimo, debe tener 15 integrantes, y que sean activos.

-El bot debe ser administrador del grupo, sino, saldrá en veinticuatro horas.

-Los usuarios no deben spammear comandos.

-Los usuarios no deben llamar al Bot.

-Los usuarios no deben abusar de ningún bug o glitch.

-Si eliminas al bot, este no volverá a entrar al grupo

* Procure que sus usuarios y administradores estén al tanto de estas reglas, sino, serán baneados del bot.*

┣━━━━━━━━━━━━━━━━━━━┫
 ✅️ *MENÚS DINÁMICOS*

.clan
.menuaudios
.menupizzeria
.menuvip (VIP💸)
.menujuegos
.menulove
.menurpg
.menucm
.menubrainrots

┣━━━━━━━━━━━━━━━━━━━┫
*QUEREMOS QUE EXPRESES TUS IDEAS✨️*

*Comandos para enviarle un mensaje al creador:

🗣 .reporte
> Con este comando reportas algo al creador del bot, puede ser un usuario con malas intenciones, errores o bugs.

🎱.pregunta <duda>
> Con este comando le preguntas algo al creador del bot (solo pregunta cosas sobre el uso del bot o serás baneado.

🧠.sugerencia <sugerencia para el bot>
> Con este comando das una sugerencia para el bot, pueden ser comandos nuevos, sistemas o personajes.

┣━━━━━━━━━━━━━━━━━━━┫
 🤣 *TE CREES CHISTOSO?* 🤣

🤣 .makechiste
> Con este comando creas un chiste para que se muestre en el bot, en *.chisteRandom*.

🤣 .chisteRandom
> Comando que sirve para ver un chiste aleatorio de los que se hayan creado.

┣━━━━━━━━━━━━━━━━━━━┫
 🐼 *ANUNCIOS Y RECOMPENSAS*

 🥏 .get <recurso> / 🥏 .get personaje
> Mira un anuncio para obtener la recompensa que hayas elegido.

 ✅️ .claimcode
> Usa este comando para canjear el código que hayas conseguido.

┣━━━━━━━━━━━━━━━━━━━┫
 🎵 *DESCARGAS & MEDIA (UTILIDAD)*

 ▶️ .play <canción>
> El bot muestra y envía el audio de la canción escrita.

 📽 .youtube <busqueda>
> Sirve como un buscador base de videos, te muestra los primeros 10 resultados de busqueda, para descargar algún video, usa .ytmp4 al privado del bot.

 ▶️ .ytmp4 <url de youtube>
> El bot envía el url transformado a video (intenta no pedir videos muy grandes).

 📽 .tiktoksearch <búsqueda>
> Sirve como un buscador para tiktok desde WhatsApp, esencial si te gusta descargar videos.

🔝 .tiktok <url>
> Comando para descargar videos de tiktok sin marca de agua.

 🔰 .instagram <url>
> Comando para descargar videos de Instagram con la url.

 🚹🚺 .pfp @usuario
> El bot envía la foto de perfil del usuario mencionado(solo si está pública).

  🅰️ .styletext <texto>
> El bot envía el texto escrito, pero con diferente estilos de letra.

 📍 .npmjs <paquete>
> El bot busca el paquete que hayas escrito, con información y link de descarga también.

 📎 .qr <texto>
> El bot transforma a QR lo que escribas.

 📎 .escanearqr
> El bot escanea el QR que haya en una imagen

 📎 .acortar <url>
> El enlace que envíes será acortado por el bot.

┣━━━━━━━━━━━━━━━━━━━┫
 📊 *INFO & SISTEMA*

 🎁 .comandos
> Revisas la cantidad de comandos del bot.

 📜 .menu
> Menú del Bot.

 ⚙️ .configmenu
> El bot muestra el menú de configuración de grupos.

🧑‍💼 .perfil
> El bot muestra tu inventario de EXP y Pandacoins.

 📶 .ping
> El bot muestra la latencia del servidor.

 🤖 .chatgpt <pregunta>
> Preguntas algo a ChatGPT desde PandaBot.

 🔚 .creditos
> Comando para ver los creditos y contactos de PandaBot.

 🎃 .mylid
> Muestra tu JID o LID de WhatsApp.

 🥏 .getjid @user
> Muestra el JID o LID del usuario mencionado.

┣━━━━━━━━━━━━━━━━━━━┫
 ✉️ *OWNER & UTILS*

 ✉️ .send <+Numero> <texto>
> Le envías un mensaje desde PandaBot al número escrito(solo si eres Owner).

 🐼.banuser
> Baneas a un usuario del bot(solo si eres Owner).

 🐼.addps <nombre> <calidad> <precio>
> Añades a un personaje a la lista(solo si eres Owner).

 🐼.addps2 <nombre> <calidad> <precio>
> COMANDO PARA OWNER JOSEFINO

🐼 .delps
> Eliminas un personaje de la lista(solo si eres Owner).

 📵 .mute @user
> El bot elimina todos los mensajes del usuario mencionado.

 🚹 .unmute @user
> Cancelas el efecto .mute.

┣━━━━━━━━━━━━━━━━━━━┫
 * 💀🚫         *

💀.ruletarusa
> Úsalo bajo tu propio riesgo.

💀.nuke
> Solo personal autorizado.

┣━━━━━━━━━━━━━━━━━━━┫
`;
    await sock.sendMessage(from, {
      image: { url: pandaBotPhoto },
      caption: menu.trim(),
      footer: '📢 Canal oficial de PandaBot',
      buttons: [
        {
          buttonId: 'canal_oficial',
          buttonText: { displayText: '🌐 Ir al Canal' },
          type: 1
        }
      ],
      headerType: 4,
      externalAdReply: {
        title: 'PandaBot Canal Oficial',
        body: 'Haz clic para unirte al canal',
        mediaType: 1,
        thumbnailUrl: pandaBotPhoto,
        sourceUrl: pandaChannel
      }
    }, { quoted: msg });

  } catch (err) {
    console.error('❌ Error enviando el menú:', err);
    await sock.sendMessage(from, {
      text: '❌ Ocurrió un error al cargar el menú. Intenta más tarde.',
    }, { quoted: msg });
  }
}

