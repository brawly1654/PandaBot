export const command = 'inforegistro';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const quotedMsg = msg.key;

  await sock.sendMessage(from, {
    text: `
INFORMACIÓN DE REGISTROS DE PANDABOT:

ATENCIÓN:

ESTE BOT ES UNA BETA CREADA EL VIERNES 11 DE JULIO DE 2025, CUALQUIER INCONVENIENTE O PROBLEMA, COMUNICARSE CON MI ADMINISTRADOR 👉(+56 9 5350 8566)

LOS REGISTROS DE PANDABOT BETA ESTÁN ADAPTADOS PARA CHATS PRIVADOS Y GRUPOS, PERO LOS PERFILES DE LOS USUARIOS REGISTRADOS SON DISTINTOS EN GRUPOS Y AL PRIVADO DEL BOT, ES DECIR, TU USUARIO O REGISTROS NO SON LOS MISMOS EN UN GRUPO Y EN EL CHAT PRIVADO DE PANDABOT, LAS ID DE WHATSAPP ESTÁN BUGEADAS.

SI NO ENTENDISTE ABSOLUTAMENTE NADA, AQUÍ TE EXPLICO:

SI TE REGISTRAS EN EL CHAT PRIVADO DEL BOT:

*Ejemplo:*

tu usuario queda registrado y guardado con tu mismo numero de whatsapp (numero del bot en este caso(+56 9 5350 8566)

SI TE REGISTRAS EN UN GRUPO:

*Ejemplo:*

tu usuario queda registrado y guardado con las IDs de WhatsApp (generalmente son numeros largos, dificiles de aprender) por lo que tu id quedaría así (id del bot en este caso +1668182918381928193 *este numero cambia según la persona que se registre*).

LO RECOMENDABLE:

Si quieres usar a PandaBot en grupos y en el chat privado, registrate una vez en cada uno, con esto basicamente tendrías un perfil destinado para grupos, y otro perfil destinado para el chat privado.

Creditos a Lukas, creador de la Beta.`,
    contextInfo: {
      stanzaId: quotedMsg.id,
      participant: quotedMsg.participant || from,
      quotedMessage: msg.message
    }
  });
}
