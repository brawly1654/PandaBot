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

export const command = 'reporte';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split('@')[0];
  const reporteText = args.join(' ');

  if (!reporteText) {
    await sock.sendMessage(from, { text: '❌ Debes especificar un motivo para el reporte. Ejemplo: *.reporte El comando .x no funciona*' });
    return;
  }

  const feedback = loadFeedback();
  const newId = feedback.length > 0 ? Math.max(...feedback.map(f => f.id)) + 1 : 1;

  const newReporte = {
    id: newId,
    type: 'reporte',
    senderJid: sender,
    content: reporteText,
    timestamp: Date.now(),
    status: 'pending'
  };
  feedback.push(newReporte);
  saveFeedback(feedback);

  const notificationText = `
🚨 *NUEVO REPORTE*
ID: *#${newId}*
De: @${senderNumber}
Contenido: ${reporteText}

Para responder: *.reply reporte ${newId} <respuesta>*
`;
  await sock.sendMessage(CREADOR_JID, { text: notificationText, mentions: [sender] });
  await sock.sendMessage(from, { text: `
✅ Tu reporte ha sido enviado. ID de tu reporte: *#${newId}*.

* No hagas reportes estúpidos o sin sentido, o serás penalizado o baneado del bot.
` });
}


