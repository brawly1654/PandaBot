const ownerNumbers = [
  '+166164298780822',
  '+56953508566',
  '+230004726169681'
];

export const command = 'hidetag';

export async function run(sock, msg, args) {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');

    if (!isGroup) {
        await sock.sendMessage(from, { text: '❗ Este comando solo funciona en grupos.\n> EASTER EGG DESCUBIERTO: USA .enigma' }, { quoted: msg });
        return;
    }

    // Obtenemos datos del grupo
    const metadata = await sock.groupMetadata(from);
    const members = metadata.participants;

    // Ver si el que envió es admin o owner
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderNumber = '+' + sender.split('@')[0]; // agregamos el +

    const isOwner = ownerNumbers.includes(senderNumber);
    const isAdmin = members.find(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));

    if (!isOwner && !isAdmin) {
        await sock.sendMessage(from, { text: '🚫 Este comando solo puede usarlo el owner o un admin.' }, { quoted: msg });
        return;
    }

    const text = args.join(' ') || '👥';

    const mentionIds = members.map(p => p.id);

    await sock.sendMessage(from, {
        text,
        mentions: mentionIds
    }, { quoted: msg });
}
