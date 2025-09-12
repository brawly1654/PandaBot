import { ownerNumber } from '../config.js';

export const command = 'checkowner';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];
  const isOwner = ownerNumber.includes('+' + sender);

  // Convertir números a formato JID
  const ownersJid = ownerNumber.map(num => num.replace('+', '') + '@s.whatsapp.net');

  let texto = '';
  if (isOwner) {
    texto += `✅ Eres un *Owner* del bot.\n📱 Tu número: +${sender}\n\n`;
  } else {
    texto += `❌ No eres un *Owner* del bot.\n📱 Tu número: +${sender}\n\n`;
  }

  texto += `👑 *Lista de Owners:*\n`;
  ownersJid.forEach(jid => {
    texto += `• @${jid.split('@')[0]}\n`;
  });

  await sock.sendMessage(from, { 
    text: texto, 
    mentions: ownersJid 
  }, { quoted: msg });
}
