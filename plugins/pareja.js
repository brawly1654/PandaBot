export const command = 'pareja';

export async function run(sock, msg, args) {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');

    if (!isGroup) {
        await sock.sendMessage(from, { text: '❗ Este comando solo funciona en grupos.' }, { quoted: msg });
        return;
    }

    // Obtiene miembros del grupo
    const metadata = await sock.groupMetadata(from);
    const participants = metadata.participants
        .filter(p => !p.id.includes('g.us')); // quitamos si hay raros

    if (participants.length < 2) {
        await sock.sendMessage(from, { text: '❗ No hay suficientes miembros en el grupo.' }, { quoted: msg });
        return;
    }

    // Elegimos dos miembros distintos al azar
    const shuffled = participants.sort(() => 0.5 - Math.random());
    const pareja = shuffled.slice(0, 2);

    const mentionIds = pareja.map(p => p.id);

    const text = `💞 La pareja del grupo es:\n@${mentionIds[0].split('@')[0]} ❤️ @${mentionIds[1].split('@')[0]}`;

    await sock.sendMessage(from, {
        text,
        mentions: mentionIds
    }, { quoted: msg });
}
