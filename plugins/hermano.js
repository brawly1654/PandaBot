import fs from 'fs';

const file = './data/hermandad.json';

function cargarHermandad() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '{}');
  return JSON.parse(fs.readFileSync(file));
}

function guardarHermandad(hermandad) {
  fs.writeFileSync(file, JSON.stringify(hermandad, null, 2));
}

export const command = 'hermano';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant;
  const mencionados = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  const hermandad = cargarHermandad();
  const target = mencionados[0] || quoted;

  if (!target) {
    await sock.sendMessage(from, { text: '🤝 Menciona a alguien para proponerle ser tu hermano/a.' });
    return;
  }

  if (target === sender) {
    await sock.sendMessage(from, { text: '❌ No puedes ser tu propio hermano/a.' });
    return;
  }
  
  const yaSonHermanos = (u1, u2) => hermandad[u1]?.includes(u2) || hermandad[u2]?.includes(u1);

  if (yaSonHermanos(sender, target)) {
    await sock.sendMessage(from, { text: '⚠️ Ya sois hermanos/as.' });
    return;
  }

  if (hermandad[`solicitud_${target}`] && hermandad[`solicitud_${target}`].includes(sender)) {
    await sock.sendMessage(from, { text: '✉️ Ya le has enviado una solicitud pendiente.' });
    return;
  }
  
  if (hermandad[`solicitud_${sender}`] && hermandad[`solicitud_${sender}`].includes(target)) {
    await sock.sendMessage(from, { text: '↩️ Tienes una solicitud de esa persona. Usa *.aceptarhermano*.' });
    return;
  }


  if (!hermandad[`solicitud_${target}`]) {
    hermandad[`solicitud_${target}`] = [];
  }
  hermandad[`solicitud_${target}`].push(sender);
  
  guardarHermandad(hermandad);

  await sock.sendMessage(from, {
    text: `💌 <@${sender.split('@')[0]}> le ha propuesto ser su hermano/a a <@${target.split('@')[0]}>!\n\nUsa *.aceptarhermano* para aceptar 🫂`,
    mentions: [sender, target]
  });
}

