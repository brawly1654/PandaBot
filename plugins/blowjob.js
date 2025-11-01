function getName(sock, jid) {
    if (sock.contacts && sock.contacts[jid] && sock.contacts[jid].name) {
        return sock.contacts[jid].name;
    }
    return jid.split('@')[0];
}

export const command = 'blowjob';

export async function run(sock, msg, args) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    
    let who;
    let mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    let quotedSender = msg.message?.extendedTextMessage?.contextInfo?.participant;
    
    if (mentionedJid.length > 0) {
        who = mentionedJid[0];
    } else if (quotedSender) {
        who = quotedSender;
    } else {
        who = sender;
    }

    let name = getName(sock, who);
    let name2 = getName(sock, sender);
    
    sock.sendMessage(from, { react: { text: '😮', key: msg.key } });

    let str;
    if (mentionedJid.length > 0) {
        str = ``;
    } else if (quotedSender) {
        str = ``;
    } else {
        str = ``.trim();
    }
    
    const videos = [
        'https://telegra.ph/file/0260766c6b36537aa2802.mp4', 
        'https://telegra.ph/file/2c1c68c9e310f60f1ded1.mp4', 
        'https://telegra.ph/file/e14f5a31d3b3c279f5593.mp4',
        'https://telegra.ph/file/e020aa808f154a30b8da7.mp4',
        'https://telegra.ph/file/1cafb3e72664af94d45c0.mp4',
        'https://telegra.ph/file/72b49d3b554df64e377bb.mp4',
        'https://telegra.ph/file/9687aedfd58a3110c7f88.mp4',
        'https://telegra.ph/file/c799ea8a1ed0fd336579c.mp4',
        'https://telegra.ph/file/7352d18934971201deed5.mp4',
        'https://telegra.ph/file/379edd38bac6de4258843.mp4'
    ];
    
    const video = videos[Math.floor(Math.random() * videos.length)];
    
    if (isGroup) {
        let mentions = [who]; 
        sock.sendMessage(from, { 
            video: { url: video }, 
            gifPlayback: true, 
            caption: str, 
            mentions: mentions 
        }, { quoted: msg });
    } else {
         sock.sendMessage(from, { 
            video: { url: video }, 
            gifPlayback: true, 
            caption: str, 
        }, { quoted: msg });
    }
}

