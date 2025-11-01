import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { ownerNumber } from '../config.js'; // asegúrate de tener aquí tus números de owner

export const command = 'transferir';

const COOLDOWN_MS = 20 * 60 * 1000;
const MAX_TRANSFERENCIA = 5_000_000;

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const ownersGroup = '120363420237055271@g.us';

  const senderId = sender.split('@')[0];
  const isOwner = ownerNumber.includes(`+${senderId}`);

  const cantidad = parseInt(args[0]);
  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  const receptor = msg.mentionedJid?.[0] || contextInfo?.mentionedJid?.[0];

  if (isNaN(cantidad) || cantidad <= 0 || !receptor) {
    await sock.sendMessage(from, {
      text: `📦 *Uso correcto:*\n.transferir <cantidad> @usuario\n\nEjemplo:\n.transferir 1000 @usuario`
    }, { quoted: msg });
    return;
  }

  // 🚫 Validar máximo solo si NO es owner
  if (!isOwner && cantidad > MAX_TRANSFERENCIA) {
    await sock.sendMessage(from, {
      text: `❌ El máximo por transferencia es de *${MAX_TRANSFERENCIA.toLocaleString()} pandacoins*.`
    }, { quoted: msg });
    return;
  }

  const db = cargarDatabase();
  db.users = db.users || {};
  db.users[sender] = db.users[sender] || { pandacoins: 0 };
  db.users[receptor] = db.users[receptor] || { pandacoins: 0 };

  // ⏳ Cooldown solo si NO es owner
  const ahora = Date.now();
  const ultimoUso = db.users[sender].ultimoTransfer || 0;
  const restante = COOLDOWN_MS - (ahora - ultimoUso);

  if (!isOwner && restante > 0) {
    const minutos = Math.floor(restante / 60000);
    const segundos = Math.floor((restante % 60000) / 1000);
    await sock.sendMessage(from, {
      text: `⏳ Este comando tiene cooldown de 20 minutos.\nIntenta nuevamente en *${minutos}m ${segundos}s*.`
    }, { quoted: msg });
    return;
  }

  if (db.users[sender].pandacoins < cantidad) {
    await sock.sendMessage(from, {
      text: `❌ No tienes suficientes pandacoins para transferir.`
    }, { quoted: msg });
    return;
  }

  const impuesto = Math.floor(cantidad * 0.16);
  const neto = cantidad - impuesto;

  db.users[sender].pandacoins -= cantidad;
  db.users[receptor].pandacoins += neto;

  // 🔑 Solo guardar cooldown si NO es owner
  if (!isOwner) {
    db.users[sender].ultimoTransfer = ahora;
  }

  guardarDatabase(db);

  const nombreRemitente =
    db.users[sender]?.alias ||
    msg.pushName ||
    `@${sender.split('@')[0].slice(0, 6)}...`;

  const nombreReceptor =
    db.users[receptor]?.alias ||
    `@${receptor.split('@')[0].slice(0, 6)}...`;

  const notificacion = `📢 *Transferencia detectada*\n\n👤 Remitente: ${nombreRemitente}\n🎯 Receptor: ${nombreReceptor}\n💸 Cantidad: *${cantidad.toLocaleString()} pandacoins*\n🧾 IVA aplicado: *${impuesto.toLocaleString()}*\n📥 Neto recibido: *${neto.toLocaleString()}*`;

  try {
    await sock.sendMessage(ownersGroup, {
      text: notificacion,
      mentions: [sender, receptor]
    });
  } catch (e) {
    console.warn('⚠️ No se pudo notificar al grupo de owners:', e.message);
  }

  await sock.sendMessage(from, {
    text: `✅ *Transferencia completada*\n\n💸 Enviados: *${cantidad.toLocaleString()} pandacoins*\n🧾 IVA: *${impuesto.toLocaleString()}*\n📥 Recibidos por ${nombreReceptor}: *${neto.toLocaleString()}*`,
    mentions: [receptor]
  }, { quoted: msg });
}
