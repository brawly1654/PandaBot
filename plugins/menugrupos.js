export const command = 'menugrupos';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const imageUrl = 'http://localhost:8000/upload/IMG-20250914-WA0228.jpg';

  const menuText = `
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

 🫡 .cum <citar mensaje>
> El bot expulsa del grupo al usuario mencionado(solo si tú y el bot son admins).

 🚫 .grupo cerrar
> El bot cierra el grupo, solo si es Admin.

 ✅️ .grupo abrir
> El bot abre el grupo, solo si es Admin.

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
      text: '❌ Ocurrió un error al cargar el menú. Intenta más tarde.',
    }, { quoted: msg });
  }
}
