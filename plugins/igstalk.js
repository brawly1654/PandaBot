import fetch from 'node-fetch';

export const command = 'igstalk';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const username = args[0];

  if (!username) {
    await sock.sendMessage(from, { text: '❌ Debes especificar un nombre de usuario de Instagram. Ejemplo: *.igstalk username_de_instagram*' });
    return;
  }

  const loadingMsg = await sock.sendMessage(from, { text: '⏳ Obteniendo información del perfil...' });

  const API_URL = `https://www.instagram.com/${encodeURIComponent(username)}/?__a=1&__d=dis`;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    const user = data.graphql.user;

    let caption = `乂 *I G - S T A L K*\n\n`;
    caption += `\t◦ *Nombre*: ${user.full_name || 'N/A'}\n`;
    caption += `\t◦ *Usuario*: ${user.username || 'N/A'}\n`;
    caption += `\t◦ *Publicaciones*: ${user.edge_owner_to_timeline_media.count || 'N/A'}\n`;
    caption += `\t◦ *Seguidores*: ${user.edge_followed_by.count || 'N/A'}\n`;
    caption += `\t◦ *Seguidos*: ${user.edge_follow.count || 'N/A'}\n`;
    caption += `\t◦ *Biografía*: ${user.biography || 'N/A'}\n`;
    caption += `\t◦ *Privado*: ${user.is_private ? '✅' : '❌'}\n\n`;
    caption += `© PandaBot`;

    await sock.sendMessage(from, { image: { url: user.profile_pic_url_hd }, caption: caption }, { quoted: msg });

  } catch (e) {
    console.error('❌ Error al obtener el perfil de Instagram:', e);
    await sock.sendMessage(from, { text: `❌ Ocurrió un error al obtener la información del perfil.` }, { quoted: msg });
  }
}

