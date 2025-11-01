import { cargarDatabase } from '../data/database.js';

export const command = 'globalrank';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const db = cargarDatabase();
  db.users = db.users || {};

  // Normalizamos y eliminamos duplicados
  const usuariosMap = new Map();

  for (const [jid, data] of Object.entries(db.users)) {
    if (!jid) continue;
    const cleanJid = jid.replace(/:.+/, ''); // elimina parte "lid:" o similar
    const userData = usuariosMap.get(cleanJid) || { pandacoins: 0 };
    userData.pandacoins = Math.max(userData.pandacoins, data.pandacoins || 0);
    usuariosMap.set(cleanJid, userData);
  }

  const usuarios = [...usuariosMap.entries()]
    .map(([jid, data]) => ({ jid, pandacoins: data.pandacoins }))
    .sort((a, b) => b.pandacoins - a.pandacoins)
    .slice(0, 10);

  if (usuarios.length === 0) {
    await sock.sendMessage(from, { text: '❌ No hay usuarios registrados aún.' }, { quoted: msg });
    return;
  }

  let texto = `🏆 *TOP 10 GLOBAL - PANDACOINS*\n\n`;
  const mentions = [];

  for (let i = 0; i < usuarios.length; i++) {
    const u = usuarios[i];
    const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🔹';
    const nombre = await obtenerNombre(sock, u.jid);
    texto += `${rankEmoji} *${i + 1}.* ${nombre}\n💰 ${u.pandacoins.toLocaleString()} Pandacoins\n\n`;
    mentions.push(u.jid);
  }

  const footer = `━━━━━━━━━━━━━━━━━━━\n🐼 *Sigue consiguiendo Pandacoins para subir en el ranking!*`;

  await sock.sendMessage(from, {
    text: texto + footer,
    mentions
  }, { quoted: msg });
}

async function obtenerNombre(sock, jid) {
  try {
    const contacto = await sock.onWhatsApp(jid);
    const id = contacto?.[0]?.jid || jid;
    const info = await sock.fetchStatus(id).catch(() => null);
    const nameData = await sock.contactSave?.[id] || {};
    const nombre = nameData.name || info?.status || id.split('@')[0];
    return `@${nombre}`;
  } catch {
    return `@${jid.split('@')[0]}`;
  }
}
