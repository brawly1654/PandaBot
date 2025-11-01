export const command = 'menurpg';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const imageUrl = 'http://localhost:8000/upload/9e465f446b584c8_file_00000000aed061f7bbd49e75fc56f43a_wm.png';

  const menuText = `
┣━━━━━━━━━━━━━━━━━━━┫
 💰 *ECONOMÍA & RPG*

 💸 .minar
> Comando principal de PandaBot, sirve para empezar tu camino en este bot, así podrás acceder a varios otros comandos y funciones, también brinda 2 o más recursos que podrás usar más adelante

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

┣━━━━━━━━━━━━━━━━━━━┫`;
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
      text: '❌ Ocurrió un error al cargar el menú de juegos. Intenta más tarde.',
    }, { quoted: msg });
  }
}

