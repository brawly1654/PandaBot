import fs from 'fs';
import path from 'path';

const CREADOR_JID = '120363420237055271@g.us';
const feedbackFile = path.resolve('./data/feedback.json');

function loadFeedback() {
  if (!fs.existsSync(feedbackFile)) {
    fs.writeFileSync(feedbackFile, JSON.stringify([], null, 2));
  }
  return JSON.parse(fs.readFileSync(feedbackFile));
}

function saveFeedback(feedback) {
  fs.writeFileSync(feedbackFile, JSON.stringify(feedback, null, 2));
}

export const command = 'pregunta';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split('@')[0];
  const preguntaText = args.join(' ');

  if (!preguntaText) {
    await sock.sendMessage(from, { text: '❌ Debes especificar el motivo de tu pregunta. Ejemplo: *.pregunta Que hace el comando .x*' });
    return;
  }

  const feedback = loadFeedback();
  const newId = feedback.length > 0 ? Math.max(...feedback.map(f => f.id)) + 1 : 1;

  const newPregunta = {
    id: newId,
    type: 'pregunta',
    senderJid: sender,
    content: preguntaText,
    timestamp: Date.now(),
    status: 'pending'
  };
  feedback.push(newPregunta);
  saveFeedback(feedback);

  const notificationText = `
❓ *NUEVA PREGUNTA*
ID: *#${newId}*
De: @${senderNumber}
Contenido: ${preguntaText}

Para responder: *.reply pregunta ${newId} <respuesta>*
`;
  await sock.sendMessage(CREADOR_JID, { text: notificationText, mentions: [sender] });
  await sock.sendMessage(from, { text: `
✅ Tu pregunta ha sido enviada. ID de tu pregunta: *#${newId}*.

* No hagas preguntas estúpidas o sin sentido, o serás penalizado o baneado del bot.
` });
}

