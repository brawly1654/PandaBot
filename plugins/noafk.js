import fs from 'fs';

const afkFile = './data/afk.json';

export const command = 'noafk';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const userId = sender.split('@')[0];

  // Si no existe el archivo AFK, no hay nada que hacer
  if (!fs.existsSync(afkFile)) {
    await sock.sendMessage(from, { text: '❌ No estabas en modo AFK.' });
    return;
  }

  const afkData = JSON.parse(fs.readFileSync(afkFile));

  // Si el usuario no está en AFK
  if (!afkData[userId]) {
    await sock.sendMessage(from, { text: '❌ No estabas en modo AFK.' });
    return;
  }

  // Eliminar el estado AFK
  delete afkData[userId];
  fs.writeFileSync(afkFile, JSON.stringify(afkData, null, 2));

  // Confirmación
  await sock.sendMessage(from, {
    text: '✅ Has salido del modo AFK.'
  });
}
