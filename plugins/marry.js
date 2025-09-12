import fs from 'fs';

const file = './data/parejas.json';

function cargarParejas() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '{}');
  return JSON.parse(fs.readFileSync(file));
}

function guardarParejas(parejas) {
  fs.writeFileSync(file, JSON.stringify(parejas, null, 2));
}

export const command = 'marry';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
  const mencionados = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  const parejas = cargarParejas();

  const target = mencionados[0] || quoted;

  if (!target) {
    await sock.sendMessage(from, { text: '💍 Menciona a alguien para proponerle matrimonio.' });
    return;
  }

  if (target === sender) {
    await sock.sendMessage(from, { text: '❌ No puedes casarte contigo mismo.' });
    return;
  }

  if (parejas[sender]) {
    await sock.sendMessage(from, { text: '⚠️ Ya estás casado. Usa `.divorcio` si quieres separarte.' });
    return;
  }

  if (parejas[target]) {
    await sock.sendMessage(from, { text: '⚠️ Esa persona ya está casada.' });
    return;
  }

  parejas[`solicitud_${target}`] = sender;
  guardarParejas(parejas);

  await sock.sendMessage(from, {
    text: `💌 <@${sender.split('@')[0]}> le ha propuesto matrimonio a <@${target.split('@')[0]}>!\n\nUsa *.aceptar* para aceptar 💍`,
    mentions: [sender, target]
  });
}
