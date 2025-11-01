export const command = 'formartrio';

const emoji = '👀'; 

export async function run(sock, msg, args) {
    const from = msg.key.remoteJid;
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const sender = msg.key.participant || msg.key.remoteJid;

    const getName = (jid) => {
        if (sock.getName) {
            const name = sock.getName(jid);
            if (name) return name;
        }
        
        return jid.split('@')[0];
    };
    
    if (mentionedJid.length === 2) {
        let person1 = mentionedJid[0];
        let person2 = mentionedJid[1];
        let person3 = sender; 
        
        let name1 = getName(person1);
        let name2 = getName(person2);
        let name3 = getName(person3);
        
        const comp1_2 = Math.floor(Math.random() * 100);
        const comp1_3 = Math.floor(Math.random() * 100);
        const comp2_3 = Math.floor(Math.random() * 100);

        let trio = `\t\t*TRIO VIOLENTOOOOO!*
        
*${name1}* y *${name2}* tienen un *${comp1_2}%* de compatibilidad como pareja.
Mientras que *${name1}* y *${name3}* tienen un *${comp1_3}%* de compatibilidad.
Y *${name2}* y *${name3}* tienen un *${comp2_3}%* de compatibilidad.

*¿Qué opinas de un trío?* 😏`;

        await sock.sendMessage(from, { 
            text: trio, 
            mentions: [person1, person2, person3] 
        }, { 
            quoted: msg 
        });
    } else {
        await sock.sendMessage(from, { text: `${emoji} Menciona a *2 usuarios* más, para calcular la compatibilidad.` }, { quoted: msg });
    }
}

