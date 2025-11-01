import fs from 'fs';
import path from 'path';

const owners = ['56953508566', '573023181375', '166164298780822', '5215538830665', '111064062640327'];
const feedbackFile = path.resolve('./data/feedback.json');

function loadFeedback() {
  if (!fs.existsSync(feedbackFile)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(feedbackFile));
}

function saveFeedback(feedback) {
  fs.writeFileSync(feedbackFile, JSON.stringify(feedback, null, 2));
}

export const command = 'reply';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split('@')[0];

  if (!owners.includes(senderNumber)) {
    await sock.sendMessage(from, { text: '❌ Solo los dueños del bot pueden usar este comando.' });
    return;
  }

  const [type, idStr, ...replyParts] = args;
  const replyText = replyParts.join(' ');
  const id = parseInt(idStr);

  if (!type || !idStr || isNaN(id) || !replyText) {
    await sock.sendMessage(from, { text: '❌ Uso: *.reply <tipo> <id> <respuesta>*. Tipos: reporte, sugerencia, pregunta.' });
    return;
  }

  const feedback = loadFeedback();
  const request = feedback.find(f => f.id === id && f.type === type && f.status === 'pending');

  if (!request) {
    await sock.sendMessage(from, { text: `❌ No se encontró una solicitud pendiente con ID *#${id}* de tipo *${type}*.` });
    return;
  }

  request.status = 'replied';
  request.reply = replyText;
  request.replyTimestamp = Date.now();
  saveFeedback(feedback);

  const replyMessage = `
💬 *Respuesta a tu ${type} #*${id}*
De: Administración de PandaBot🐼

Mensaje: ${request.content}

*Respuesta:*
${replyText}
`;

  await sock.sendMessage(request.senderJid, { text: replyMessage });
  await sock.sendMessage(from, { text: `✅ Respuesta enviada a la solicitud *#${id}* de tipo *${type}*.` });
}

