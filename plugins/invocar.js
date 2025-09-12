const ownerNumbers = [
  '+166164298780822',
  '+56953508566'
];

export const command = 'invocar';

export async function run(sock, msg, args) {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');

    if (!isGroup) {
        await sock.sendMessage(from, { text: '❗ Este comando solo funciona en grupos.' }, { quoted: msg });
        return;
    }

    const metadata = await sock.groupMetadata(from);
    const members = metadata.participants;

    const sender = msg.key.participant || msg.key.remoteJid;
    const senderNumber = '+' + sender.split('@')[0];

    const isOwner = ownerNumbers.includes(senderNumber);
    const isAdmin = members.find(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));

    if (!isOwner && !isAdmin) {
        await sock.sendMessage(from, { text: '🚫 Este comando solo puede usarlo el owner o un admin.' }, { quoted: msg });
        return;
    }

    const motivo = args.join(' ') || '👥 ¡Atención todos!';

    const mentionIds = members.map(p => p.id);

    const text = `📢 ${motivo}\n\n` + mentionIds.map(id => `@${id.split('@')[0]}`).join(' ');

    await sock.sendMessage(from, {
        text,
        mentions: mentionIds
    }, { quoted: msg });
}
