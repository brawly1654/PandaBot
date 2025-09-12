import fs from 'fs';

export const command = 'manuela';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  await sock.sendMessage(from, {
    react: { text: '🍆', key: msg.key }
  });

  await sock.sendMessage(from, {
    react: { text: '💦', key: msg.key }
  });


  await sock.sendMessage(from, {
    react: { text: '🍆', key: msg.key }
  });


  await sock.sendMessage(from, {
    react: { text: '💦', key: msg.key }
  });


  await sock.sendMessage(from, {
    react: { text: '🍆', key: msg.key }
  });


  await sock.sendMessage(from, {
    react: { text: '💦', key: msg.key }
  });


  await sock.sendMessage(from, {
    react: { text: '🍆', key: msg.key }
  });


  await sock.sendMessage(from, {
    react: { text: '🥵', key: msg.key }
  });
}
