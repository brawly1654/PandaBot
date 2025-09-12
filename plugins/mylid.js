import {
  exec
} from 'child_process';
import {
  downloadContentFromMessage
} from '@whiskeysockets/baileys';

// Funciones auxiliares
const DIGITS = (s = "") => (s || "").replace(/\D/g, "");

/** Busca el LID usando varias rutas posibles */
function findLid(realJid, sock) {
  const tryPaths = [
    () => sock?.store?.contacts?.[realJid]?.lid,
    () => global?.init?.users?.[realJid]?.lid,
    () => global?.db?.data?.users?.[realJid]?.lid,
  ];
  for (const get of tryPaths) {
    try {
      const v = get();
      if (v) return String(v);
    } catch {}
  }
  return null;
}

/** Si viene @lid, intenta hallar su @s.whatsapp.net recorriendo caches */
function findRealFromLid(lidJid, sock) {
  const lidDigits = DIGITS(lidJid);
  const buckets = [
    sock?.store?.contacts,
    global?.init?.users,
    global?.db?.data?.users
  ].filter(Boolean);

  for (const bucket of buckets) {
    try {
      for (const [jid, data] of Object.entries(bucket)) {
        const cand = data?.lid || data?.LID;
        if (cand && DIGITS(String(cand)) === lidDigits) return jid;
      }
    } catch {}
  }
  return null;
}

export const command = 'mylid';

export async function run(sock, msg) {
  const chatId = msg.key.remoteJid;

  // Reacciona al inicio
  try {
    await sock.sendMessage(chatId, {
      react: {
        text: "🛰️",
        key: msg.key
      }
    });
  } catch {}

  // Detectar citado (participante del mensaje citado)
  const ctx = msg.message?.extendedTextMessage?.contextInfo;
  const citado = ctx?.participant;

  let objetivo = citado || (msg.key.participant || msg.key.remoteJid);
  let realJid;

  if (citado) {
    if (citado.endsWith("@s.whatsapp.net")) {
      realJid = citado;
    } else if (citado.endsWith("@lid")) {
      realJid = findRealFromLid(citado, sock);
      if (!realJid) realJid = msg.key.jid || msg.key.participant || msg.key.remoteJid;
    }
  } else {
    realJid = msg.key.jid || msg.key.participant || msg.key.remoteJid;
  }

  if (realJid?.endsWith?.("@g.us")) {
    realJid = msg.key.jid || msg.key.participant || "";
  }

  if (realJid && !realJid.endsWith("@s.whatsapp.net")) {
    const only = DIGITS(realJid);
    if (only) realJid = `${only}@s.whatsapp.net`;
  }

  let lidJid;
  if (objetivo?.endsWith?.("@lid")) {
    lidJid = objetivo;
  } else {
    const keyForLid = citado?.endsWith?.("@s.whatsapp.net") ? citado : realJid;
    const found = findLid(keyForLid, sock);
    if (found) {
      lidJid = /@lid$/.test(found) ? found : `${DIGITS(found)}@lid`;
    }
  }

  const realNum = realJid ? DIGITS(realJid) : null;
  const tipoObj = objetivo?.endsWith?.("@lid") ? "LID oculto (@lid)" : "Número visible (@s.whatsapp.net)";

  const texto = `
📡 *Info de usuario*
👤 *Objetivo:* ${objetivo || "desconocido"}
🔐 *Tipo actual:* ${tipoObj}
📱 *Número real:* ${realNum ? `+${realNum}` : "No disponible"}
🧬 *LID:* ${lidJid ? `\`${lidJid}\`` : "No disponible"}
  `.trim();

  await sock.sendMessage(chatId, {
    text: texto
  }, {
    quoted: msg
  });

  try {
    await sock.sendMessage(chatId, {
      react: {
        text: "✅",
        key: msg.key
      }
    });
  } catch {}
}

