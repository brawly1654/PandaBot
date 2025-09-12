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
🌸 *Versión:* 2.0
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

.menuimg (DISABLED🚫)
.clan
.menuaudios
.menupizzeria
.menuvip (VIP💸)
.menupets

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
 🎮 *JUEGOS & FUN*

 🐱 .cat
> El bot muestra una imagen aleatoria de un gato.

 🐕 .dog
> El bot muestra una imagen aleatoria de un perro.

 🎌 .adivinabandera
> Adivina la bandera que muestra el Bot.

 🏅 .ranking
> Muestra el top de personas que mas victorias llevan en .adivinabandera.

 🎗 .ahorcado
> Juegas al clasico juego del ahorcado en el bot.

 🥇 .topahorcados
> Muestra el top de personas con más victorias en ahorcado.

 🫰 .simprate @user
> El bot dice qué tan Simp es el usuario mencionado.

 😎 .facherometro @user
> El bot dice qué tan fachero es el usuario mencionado.

 🌈 .gay @user
> El bot dice qué tan gay es el usuario mencionado.

 🧠 .inteligencia @user
> El bot dice qué tan inteligente es el usuario mencionado.

 💃 .probaile @user
> El bot dice qué tan bueno bailando es el usuario mencionado.

 📺 .otaku @user
> El bot dice qué tan otaku es el usuario mencionado.

 🍀 .luck @user
> El bot dice qué tan suertudo es el usuario mencionado.

 🪙 .moneda
> Lanzas una moneda, puede tocar cara o cruz.

 🎲 .dado
> Lanzas un dado, puede tocar un número del uno al seis.

 🎱 .bolaocho <pregunta>
> Le haces una pregunta a la bola ocho.

 💕 .abrazo @user
> Abrazas al usuario mencionado.

 🤭 .pajer@ @user
> El bot dice qué tan pajero es el usuario mencionado.

 🔥 .topactivos
> El bot muestra el top de personas con más mensajes enviados.

 🔰 .pokedex <pokemon>
> El bot muestra todo sobre el pokemon elegido.

 👅 .paja @user
> Le dedicas una paja al usuario mencionado.😳

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
 💰 *ECONOMÍA & RPG*

 💸 .minar
> Comando principal de PandaBot, sirve para empezar tu camino en este bot, así podrás acceder a varios otros comandos y funciones, también brinda 2 o más recursos que podrás usar más adelante.

 💼 .trabajar
> Consigues EXP y Pandacoins trabajando.

 🐼 .cazar
> Cazas y consigues EXP y Pandacoins.

 🛡 .viewps
> El bot muestra la lista de todos los personajes existentes.

 🛡 .buy <personaje>
> Compras el personaje escrito, solo si está disponible.

 🛡 .misps
> El bot muestra tus personajes actuales.

 ✨️ .hourly
> Reclamas tu recompensa disponible cada hora.

 ✨️ .daily
> Reclamas tu recompensa disponible cada día.

 ✨️ .weekly
> Reclamas tu recompensa disponible cada semana.

 ✨️ .monthly
> Reclamas tu recompensa disponible cada mes.

 📦 .cofre
> Reclamas un cofre disponible cada una hora, en el que pueden salir diferentes calidades; común, raro, épico y legendario. Cada una con distinta probabilidad.

 💰 .aventura
> Sales de expedición y consigues recursos.

 💰 .minar
> Minas para obtener recursos y conseguir un espacio en la base de datos.
 🛡 .sell <personaje>
> Con este comando puedes vender uno de tus personajes.

 🛡 .ps
> Obtienes un personaje aleatorio.

 🛡.robarps @user
> Intentas robarle un personaje aleatorio al usuario mencionado.

 🛡 .regalarps <nombre> @user
> Regalas el personaje elegido al usuario mencionado.

 🛡 .checkps @user/<personaje>
> Revisas los personajes de algún usuario o revisas dónde está el personaje.

 🛡 .drop <calidad> (OWNER COMMAND)
> Dropeas un personaje aleatorio de la calidad a todos los usuarios del bot.

 🛡 .añadirps @user <nombre> (OWNER COMMAND)
> Añades un personaje al inventario del usuario mencionado.

 🛡 .verps <Nombre del personaje>
> El bot muestra toda la información del personaje.

┣━━━━━━━━━━━━━━━━━━━┫
 *💰COIN MASTER SYSTEM*

 💰 .tirar
> Haces un giro en el que puedes conseguir diferentes recursos.(coins, tiros, creditos y escudos)

 💰 .walletcm
> Revisas tu inventario de recursos.

 💰 .tirar10
> Haces 10 giros seguidos.

 💰 .tirar20
> Haces 20 giros seguidos.

 💰 .mejorar
> Mejoras tu Aldea a cambio de coins.

 💰 .dailycm
> Reclamas tu recompensa diaria de tiros.

 💰 .atacar @user
> Atacas al usuario mencionado para intentar quitarle recursos.

 💰 .robar @user
> Le robas recursos al usuario mencionado.

 💰 .regalartiros <cantidad> @user
> Le regalas una cantidad de tiros al usuario mencionado.

 💰 .megatirar
> Haces 30 giros seguidos.

 💰 .eventocm (owner)
> Haces un evento global donde TODOS consiguen recursos.

 💰 .pay @user <cantidad>
> Le pagas Coins al usuario mencionado.

┣━━━━━━━━━━━━━━━━━━━┫
 🛠️ *ADMIN & MODERACIÓN*

 ✅ .enable
> Habilitas una función del menú de configuración de grupos (.configmenu) solo si eres admin.

 🚫 .disable
> Desabilitas una función de .configmenu(solo si eres admin).

 🛡️ .warn @user
> Le das una advertencia al usuario mencionado(solo si eres admin), al llegar a las 3 advertencias, el usuario es eliminado del grupo.

🛡️ .unwarn @user
> Le quitas una advertencia al usuario mencionado(solo si eres admin).

 📋 .advertencias
> El bot muestra la lista de las advertencias de usuarios del grupo.

 📶 .promote @user
> El bot hace administrador al usuario mencionado(solo si tú y el bot son admins).

 📉 .demote @user
> El bot quita de administrador al usuario mencionado.

 📝 .hidetag <texto>
> El bot menciona a todos los usuarios del grupo(sin mención explicita) en el mensaje escrito.

 🗣️ .invocar <texto>
> El bot menciona a todos los usuarios del grupo, ademas mostrando el mensaje escrito.

 🏘️ .groupinfo
> El bot muestra la información del grupo.

 🫡 .ban <citar mensaje>
> El bot expulsa del grupo al usuario mencionado(solo si tú y el bot son admins).

 🚫 .grupo cerrar
> El bot cierra el grupo, solo si es Admin.

 ✅️ .grupo abrir
> El bot abre el grupo, solo si es Admin.

┣━━━━━━━━━━━━━━━━━━━┫
 🎵 *DESCARGAS & MEDIA (UTILIDAD)*

 ▶️ .play <canción>
> El bot muestra y envía el audio de la canción escrita.

 📽 .youtube <busqueda>
> Sirve como un buscador base de videos, te muestra los primeros 10 resultados de busqueda, para descargar algún video, usa .ytmp4 al privado del bot.

 ▶️ .ytmp4 <url de youtube>
> El bot envía el url transformado a video (intenta no pedir videos muy grandes).

 🚫.furry
> Nada que decir.🤭 (COMANDO NSFW)

 📍.definir <palabra>
> El bot intenta usar un diccionario para buscar el significado a la palabra.

 ⛅️.tiempo <ciudad>
> Muestra el clima de una ciudad en particular.

 🅰️ .traducir <idioma> | <texto>
> El bot traduce el texto que escribas.

  📽.squidgame
> El bot envía un Edit aleatorio del Juego del Calamar.

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

 📍 .mediafire <url> (BETA)
> El bot envía el archivo de la URL de mediafire para descargar.

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

 🎟 .afk <motivo>
> Activas tu modo AFK, nadie te podrá mencionar. (VIP)

 🎟 .noafk
> Desactivas tu modo AFK.

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

 🐼.addps3 <nombre> <calidad> <precio>
> COMANDO PARA SAI.

🐼 .delps
> Eliminas un personaje de la lista(solo si eres Owner).

 📵 .mute @user
> El bot elimina todos los mensajes del usuario mencionado.

 🚹 .unmute @user
> Cancelas el efecto .mute.

┣━━━━━━━━━━━━━━━━━━━┫
*🧠BRAINROTS*

🧠 .tungtungtungsahur
> El bot muestra un video de tung tung tung tung tung tung tung tung tung Sahur.

🧠 .garammaram
> El bot muestra un video de Garam and Madungdung.

🧠 .tralalerotralala
> El bot muestra un video de Tralalero Tralala.

🧠 .lostralaleritos
> El bot muestra un video de Los Tralaleritos.

🧠 .lavacca
> El bot muestra un video de La Vacca Saturno Saturnita.

🧠 .agarrinilapalini
> El bot muestra un video de Agarrini La Palini.

🧠 .girafaceleste
> El bot muestra un video de Girafa Celeste.

🧠 .grancombinasion
> El bot muestra un video de La Grande Combinasion.

🧠 .brrbrrpatapim
> El bot muestra un video de Brr Brr Patapim.

🧠 .lirililarila
> El bot muestra un video de Lirili Larila.

🧠 .frulifrula
> El bot muestra un video de Fruli Frula.

🧠 .chicleteira
> El bot muestra un video de Chicleteira Bicicleteira.

🧠 .basbas
> El bot muestra un video de Bas Bas Kotak Bas.

┣━━━━━━━━━━━━━━━━━━━┫
 * 💀🚫         *

💀.ruletarusa
> Úsalo bajo tu propio riesgo.

💀.nuke
> Solo personal autorizado.

┣━━━━━━━━━━━━━━━━━━━┫
 *CREADOR👑*

👑.addowner
👑.delowner

┣━━━━━━━━━━━━━━━━━━━┫
`;
    // Enviamos el mensaje de imagen con botones y pie de página
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

