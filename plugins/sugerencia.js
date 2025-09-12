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

export const command = 'sugerencia';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split('@')[0];
  const sugerenciaText = args.join(' ');

  if (!sugerenciaText) {
    await sock.sendMessage(from, { text: '❌ Debes especificar tu sugerencia. Ejemplo: *.sugerencia Agrega un comando de minijuego*' });
    return;
  }

  const feedback = loadFeedback();
  const newId = feedback.length > 0 ? Math.max(...feedback.map(f => f.id)) + 1 : 1;

  const newSugerencia = {
    id: newId,
    type: 'sugerencia',
    senderJid: sender,
    content: sugerenciaText,
    timestamp: Date.now(),
    status: 'pending'
  };
  feedback.push(newSugerencia);
  saveFeedback(feedback);

  const notificationText = `
💡 *NUEVA SUGERENCIA*
ID: *#${newId}*
De: @${senderNumber}
Contenido: ${sugerenciaText}

Para responder: *.reply sugerencia ${newId} <respuesta>*
`;
  await sock.sendMessage(CREADOR_JID, { text: notificationText, mentions: [sender] });
  await sock.sendMessage(from, { text: `
✅ Tu sugerencia ha sido enviada. ID de tu sugerencia: *#${newId}*.

* No hagas sugerencias estúpidas o sin sentido, o serás penalizado o baneado del bot.
` });
}

