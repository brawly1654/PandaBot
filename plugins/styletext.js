export const command = 'styletext';

// Mapeos de caracteres para diferentes estilos de texto
const styles = [
  { name: 'Negrita', from: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇' },
  { name: 'Itálica', from: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: '𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻' },
  { name: 'Negrita y Cursiva', from: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: '𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯' },
  { name: 'Letra gótica', from: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: '𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷' },
  { name: 'Monospace', from: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: '𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣' },
  { name: 'Circulado', from: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', to: 'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ⓪①②③④⑤⑥⑦⑧⑨' },
  { name: 'Cuadrado', from: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', to: '🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🄲🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉0123456789' },
  { name: 'Letra antigua', from: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', to: '𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟' },
];

// Función para estilizar el texto
function stylizeText(text, style) {
  let result = '';
  for (const char of text) {
    const index = style.from.indexOf(char);
    if (index !== -1) {
      result += style.to[index];
    } else {
      result += char;
    }
  }
  return result;
}

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (args.length < 2) {
    // Si no se da un número o texto, muestra la lista de opciones
    let menu = '🎨 *Estilos de Texto Disponibles:*\n\n';
    styles.forEach((style, index) => {
      menu += `*${index + 1}.* ${style.name}\n`;
    });
    menu += '\n📌 Uso: *.styletext <número> <texto>*';
    await sock.sendMessage(from, { text: menu }, { quoted: msg });
    return;
  }

  const styleNumber = parseInt(args[0]);
  const textToStylize = args.slice(1).join(' ');

  if (isNaN(styleNumber) || styleNumber < 1 || styleNumber > styles.length) {
    await sock.sendMessage(from, { text: '❌ El número de estilo no es válido. Usa *.styletext* para ver las opciones.' }, { quoted: msg });
    return;
  }

  const selectedStyle = styles[styleNumber - 1];
  const styledText = stylizeText(textToStylize, selectedStyle);

  const finalMessage = `
✍️ *Texto Estilizado:*

*Original:* ${textToStylize}
*Estilo:* ${selectedStyle.name}

${styledText}
`;

  await sock.sendMessage(from, { text: finalMessage.trim() }, { quoted: msg });
}

