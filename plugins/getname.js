// plugins/getname.js
import fs from 'fs';

export const command = 'getname';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  const targetJid = (mentioned && mentioned.length > 0)
    ? mentioned[0]
    : (msg.key.participant || msg.key.remoteJid);

  try {
    // Obtener nombre legible del usuario
    const displayName = await getDisplayName(sock, from, targetJid);

    // Intentar obtener foto de perfil
    let pfp;
    try {
      pfp = await sock.profilePictureUrl(targetJid, 'image');
    } catch {
      pfp = 'https://i.ibb.co/sK1j4qR/avatar.png'; // Imagen por defecto
    }

    const text = `👤 *Nombre del usuario:*\n${displayName}`;

    await sock.sendMessage(from, {
      text,
      mentions: [targetJid],
      contextInfo: {
        mentionedJid: [targetJid],
        externalAdReply: {
          title: displayName,
          body: "Información del usuario",
          thumbnailUrl: pfp,
          sourceUrl: "https://whatsapp.com/channel/0029Vb6SmfeAojYpZCHYVf0R",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: msg });

  } catch (e) {
    console.error('Error en .getname:', e);
    await sock.sendMessage(from, { text: '❌ Error al obtener el nombre del usuario.' }, { quoted: msg });
  }
}

async function getDisplayName(sock, from, jid) {
  try {
    // 1️⃣ Si estamos en grupo, buscar en metadata
    if (from.endsWith('@g.us')) {
      const metadata = await sock.groupMetadata(from);
      const participant = metadata.participants.find(p => p.id === jid);
      if (participant) {
        // Buscar nombre guardado en grupo
        if (participant.notify) return participant.notify;
        if (participant.name) return participant.name;
      }
    }

    // 2️⃣ Intentar obtener nombre con getName (función nativa de Baileys)
    if (typeof sock.getName === 'function') {
      const name = await sock.getName(jid);
      if (name && !/^[0-9]+$/.test(name)) return name;
    }

    // 3️⃣ Buscar en contactos si existe
    const contact = sock.contacts?.[jid];
    if (contact) {
      if (contact.name) return contact.name;
      if (contact.notify) return contact.notify;
    }

    // 4️⃣ Fallback: usar pushName del mensaje si es del remitente
    if (jid === msg?.key?.participant && msg?.pushName) return msg.pushName;

    // 5️⃣ Último recurso: número limpio
    return jid.split('@')[0];

  } catch (err) {
    console.error('Error en getDisplayName:', err);
    return jid.split('@')[0];
  }
}
