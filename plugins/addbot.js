import fs from 'fs';
import path from 'path';

const CREADOR_JID = '56953508566@s.whatsapp.net';
const owners = ['56953508566', '573023181375', '166164298780822'];
const requestsFile = path.resolve('./data/joinrequests.json');

function loadRequests() {
  if (!fs.existsSync(requestsFile)) {
    fs.writeFileSync(requestsFile, JSON.stringify([], null, 2));
  }
  return JSON.parse(fs.readFileSync(requestsFile));
}

function saveRequests(requests) {
  fs.writeFileSync(requestsFile, JSON.stringify(requests, null, 2));
}

export const command = 'addbot';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split('@')[0];

  const subCommand = args[0]?.toLowerCase();
  const requestId = parseInt(args[1]);

  if (subCommand === 'aceptar' || subCommand === 'rechazar') {
    if (!owners.includes(senderNumber)) {
      await sock.sendMessage(from, { text: '❌ Solo los dueños del bot pueden usar este comando.' });
      return;
    }

    const requests = loadRequests();
    const request = requests.find(r => r.id === requestId && r.status === 'pending');

    if (!request) {
      await sock.sendMessage(from, { text: `❌ No se encontró la solicitud #${requestId} pendiente.` });
      return;
    }

    if (subCommand === 'aceptar') {
      try {
        const inviteCode = request.groupLink.split('/')[3];
        // --- CÓDIGO CORREGIDO: Se usa la función correcta `groupJoin` ---
        await sock.groupJoin(inviteCode);

        request.status = 'accepted';
        saveRequests(requests);
        await sock.sendMessage(from, { text: `✅ Solicitud #${requestId} aceptada. El bot se unirá al grupo.` });
        await sock.sendMessage(request.senderJid, { text: `🎉 ¡Tu solicitud ha sido aprobada! PandaBot se unió a tu grupo.` });
      } catch (e) {
        await sock.sendMessage(from, { text: `❌ Hubo un error al unirse al grupo. Posiblemente el enlace es inválido, el bot ha sido removido o no es admin del grupo.` });
      }
    } else {
      request.status = 'rejected';
      saveRequests(requests);
      await sock.sendMessage(from, { text: `❌ Solicitud #${requestId} rechazada.` });
      await sock.sendMessage(request.senderJid, { text: `💔 Tu solicitud para que PandaBot se una a tu grupo ha sido rechazada, tu grupo no cunple los requisitos para que PandaBot se una.` });
    }
    return;
  }

  const groupLink = args[0];
  const linkRegex = /https:\/\/chat.whatsapp.com\/[a-zA-Z0-9]{22}/;

  if (!groupLink || !linkRegex.test(groupLink)) {
    await sock.sendMessage(from, { text: '❌ Debes proporcionar un enlace de invitación de grupo válido.' });
    return;
  }

  const requests = loadRequests();
  const newRequestId = requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1;

  const newRequest = {
    id: newRequestId,
    senderJid: sender,
    groupLink: groupLink,
    status: 'pending',
    timestamp: Date.now()
  };
  requests.push(newRequest);
  saveRequests(requests);

  const notificationText = `
🔔 *NUEVA SOLICITUD PARA UNIRSE A GRUPO*
ID de Solicitud: *#${newRequestId}*
Solicitado por: @${senderNumber}
Enlace del Grupo: ${groupLink}

Para aceptar: *.addbot aceptar ${newRequestId}*
Para rechazar: *.addbot rechazar ${newRequestId}*
`;
  await sock.sendMessage(CREADOR_JID, { text: notificationText, mentions: [sender] });
  await sock.sendMessage(from, { text: `✅ Tu solicitud ha sido enviada con el ID *#${newRequestId}*. El creador del bot la revisará.` });
}

