import fetch from 'node-fetch';

export const command = 'tiktokstalk';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const pref = '.';
  const username = args.join(" ");

  if (!username) {
    await sock.sendMessage(from, {
      text: `⚠️ *Uso incorrecto.*\n\n📌 *Ejemplo:* \`${pref}tiktokstalk russellxzpty\``
    }, { quoted: msg });
    return;
  }

  await sock.sendMessage(from, {
    react: { text: '⏳', key: msg.key }
  });

  try {
    const apiUrl = `https://api.dorratz.com/v3/tiktok-stalk?username=${encodeURIComponent(username)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);

    const { userInfo } = await res.json();
    if (!userInfo) throw new Error("No se pudo obtener la información del usuario.");

    const caption =
      `📱 *Perfil de TikTok*\n\n` +
      `👤 *Nombre:* ${userInfo.nombre}\n` +
      `📌 *Usuario:* @${userInfo.username}\n` +
      `🆔 *ID:* ${userInfo.id}\n` +
      `📝 *Bio:* ${userInfo.bio}\n` +
      `✅ *Verificado:* ${userInfo.verificado ? 'Sí' : 'No'}\n\n` +
      `📊 *Seguidores:* ${userInfo.seguidoresTotales}\n` +
      `👀 *Siguiendo:* ${userInfo.siguiendoTotal}\n` +
      `❤️ *Likes Totales:* ${userInfo.meGustaTotales}\n` +
      `🎥 *Videos:* ${userInfo.videosTotales}\n` +
      `🤝 *Amigos:* ${userInfo.amigosTotales}\n\n` +
      `© PandaBot`;

    await sock.sendMessage(from, {
      image: { url: userInfo.avatar },
      caption,
      mimetype: 'image/jpeg'
    }, { quoted: msg });

    await sock.sendMessage(from, {
      react: { text: "✅", key: msg.key }
    });

  } catch (error) {
    console.error("❌ Error en .tiktokstalk:", error);
    await sock.sendMessage(from, {
      text: `❌ *Error al obtener perfil TikTok:*\n_${error.message}_`
    }, { quoted: msg });

    await sock.sendMessage(from, {
      react: { text: "❌", key: msg.key }
    });
  }
}

