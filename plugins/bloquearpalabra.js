import fs from 'fs';
import path from 'path';

const dataPath = path.resolve('./data/blockedWords.json');
if (!fs.existsSync(dataPath)) fs.writeFileSync(dataPath, JSON.stringify({}));

export const command = 'bloquearpalabra';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split('@')[0];

  // Solo admins y dueños pueden usar este comando
  const allowedNumbers = ['56953508566', '166164298780822']; // <-- cambia a tus números
  const groupMetadata = await sock.groupMetadata(from);
  const isAdmin = groupMetadata.participants.find(p => p.id === sender && p.admin)?.admin;

  if (!isAdmin && !allowedNumbers.includes(senderNumber)) {
    await sock.sendMessage(from, { text: '❌ No tienes permisos para usar este comando.' }, { quoted: msg });
    return;
  }

  if (args.length === 0) {
    await sock.sendMessage(from, { text: '✏️ Uso: *.bloquearpalabra <palabra>*\n📜 Para ver la lista: *.bloquearpalabra lista*' }, { quoted: msg });
    return;
  }

  const blockedWords = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  blockedWords[from] = blockedWords[from] || [];

  if (args[0].toLowerCase() === 'lista') {
    const lista = blockedWords[from].length > 0 ? blockedWords[from].join(', ') : 'No hay palabras bloqueadas.';
    await sock.sendMessage(from, { text: `📜 *Palabras bloqueadas:*\n${lista}` }, { quoted: msg });
    return;
  }

  const palabra = args[0].toLowerCase();

  if (!blockedWords[from].includes(palabra)) {
    blockedWords[from].push(palabra);
    fs.writeFileSync(dataPath, JSON.stringify(blockedWords, null, 2));
    await sock.sendMessage(from, { text: `✅ Palabra bloqueada: *${palabra}*` }, { quoted: msg });
  } else {
    await sock.sendMessage(from, { text: `⚠️ La palabra *${palabra}* ya está bloqueada.` }, { quoted: msg });
  }
}
