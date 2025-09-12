import fs from 'fs';

export const command = 'advertencias';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const warnsFile = './data/warns.json';
  let warns = {};
  if (fs.existsSync(warnsFile)) {
    warns = JSON.parse(fs.readFileSync(warnsFile, 'utf8'));
  }

  const groupWarns = warns[from] || {};
  const list = Object.entries(groupWarns)
    .filter(([_, count]) => count > 0)
    .map(([user, count]) => `@${user.split('@')[0]} → ${count} advertencia(s)`)
    .join('\n');

  const text = list || '✅ Ningún usuario tiene advertencias en este grupo.';
  await sock.sendMessage(from, { text, mentions: Object.keys(groupWarns) });
}
