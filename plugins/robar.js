import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { isVip } from '../utils/vip.js';

const cooldowns = {};

export const command = 'robar';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const now = Date.now();
  const COOLDOWN_MS = 20 * 60 * 1000;

  if (cooldowns[sender] && now - cooldowns[sender] < COOLDOWN_MS) {
    const restante = COOLDOWN_MS - (now - cooldowns[sender]);
    const minutos = Math.floor(restante / 60000);
    const segundos = Math.floor((restante % 60000) / 1000);
    await sock.sendMessage(from, {
      text: `⏳ Debes esperar *${minutos}m ${segundos}s* antes de volver a robar.`,
    }, { quoted: msg });
    return;
  }

  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  const mencionado = msg.mentionedJid?.[0] || contextInfo?.mentionedJid?.[0];

  if (!mencionado || mencionado === sender) {
    await sock.sendMessage(from, {
      text: `❌ Especifica a quién le quieres robar usando una mención.`,
    }, { quoted: msg });
    return;
  }

  const db = cargarDatabase();
  db.users = db.users || {};
  db.users[sender] = db.users[sender] || { pandacoins: 0 };
  db.users[mencionado] = db.users[mencionado] || { pandacoins: 0 };

  const atacante = db.users[sender];
  const victima = db.users[mencionado];

  const vip = isVip(sender);
  const probabilidadExito = vip ? 0.7 : 0.5;
  const resultado = Math.random() < probabilidadExito;

  const cantidad = Math.floor(Math.random() * 500000) + 1;

  let texto = '';
  if (resultado) {
    const robado = Math.min(cantidad, victima.pandacoins);
    atacante.pandacoins += robado;
    victima.pandacoins -= robado;

    texto = `🕵️‍♂️ *Robo exitoso*\n\n@${sender.split('@')[0]} robó *${robado} pandacoins* a @${mencionado.split('@')[0]}.\n`;
    texto += vip ? '👑 El ladrón era VIP, tenía ventaja.\n' : '🎲 Fue suerte pura.';
  } else {
    const perdido = Math.min(cantidad, atacante.pandacoins);
    atacante.pandacoins -= perdido;

    texto = `🚨 *Fallaste el robo*\n\nLa policía atrapó a @${sender.split('@')[0]} intentando robar a @${mencionado.split('@')[0]}.\n`;
    texto += `💸 Multa: *${perdido} pandacoins*\n`;
    texto += vip ? '👑 A pesar de ser VIP, no se salvó.\n' : '👮 Mala suerte, no eres VIP.';
  }

  guardarDatabase(db);
  cooldowns[sender] = now;

  await sock.sendMessage(from, {
    text: texto.trim(),
    mentions: [sender, mencionado],
  }, { quoted: msg });
}
