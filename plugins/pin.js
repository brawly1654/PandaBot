import pkg from '@whiskeysockets/baileys';
const { proto } = pkg;

export const command = 'pin';
/** * 24 hours, 7 days, 30 days  time?: 86400 | 604800 | 2592000 */
// unpin: sock.chatModify({ pin: false }, '123456@s.whatsapp.net')
export async function run(sock, msg, args) {
    const from = msg.key.remoteJid;
    const getMessage = msg.message;
    const timeString = args[0];
    let timeMinutes;
    switch (timeString) {
        case 'day':
            timeMinutes = 86400;
            break;
        case 'week':
            timeMinutes = 604800;
            break;
        case 'month':
            timeMinutes = 2592000;
            break;
        default:
            timeMinutes = 86400;
            break;
    }
    console.log("📌 Fijando mensaje en el chat:", from, "por", timeString || 'day', "Minutos", timeMinutes);
    //get key from quoted message key
     // si es respuesta a un mensaje
  const quoted = msg.message?.extendedTextMessage?.contextInfo;
  let key;

  if (quoted?.stanzaId) {
    key = {
      remoteJid: from,
      id: quoted.stanzaId,
      participant: quoted.participant || undefined
    };
  } else {
    // si no hay citado, fijamos el mismo mensaje
    key = msg.key;
  }

    try {
        await sock.sendMessage(msg.key.remoteJid, {
              pin: key,
              type: proto.PinInChat.Type.PIN_FOR_ALL,
              time: timeMinutes,
            });

        console.log("✅ Mensaje fijado en el chat:", from);

    } catch (err) {
        console.error("❌ Error al fijar el mensaje:", err);
    }
}
