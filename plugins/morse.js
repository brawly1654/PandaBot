export const command = 'morse';

const morseCode = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
  'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
  'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', ' ': '/'
};

const morseMap = new Map(Object.entries(morseCode));
const reverseMorseMap = new Map(Object.entries(morseCode).map(([key, value]) => [value, key]));

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const subCommand = args[0]?.toLowerCase();
  const text = args.slice(1).join(' ');

  if (subCommand === 'codificar') {
    if (!text) {
      await sock.sendMessage(from, { text: '❌ Debes darme un texto para codificar. Ejemplo: *.morse codificar Hola Mundo*' });
      return;
    }
    const codificado = text.toUpperCase().split('').map(char => morseMap.get(char) || '').join(' ');
    await sock.sendMessage(from, { text: `${codificado}` });

  } else if (subCommand === 'decodificar') {
    if (!text) {
      await sock.sendMessage(from, { text: '❌ Debes darme un código morse para decodificar. Ejemplo: *.morse decodificar .... --- .-.. .--.  .- -..- -.-. ---*' });
      return;
    }
    const decodificado = text.split(' ').map(code => reverseMorseMap.get(code) || '').join('');
    await sock.sendMessage(from, { text: `${decodificado}` });

  } else {
    const usage = `
❌ Uso incorrecto.
Comandos disponibles:
* .morse codificar <texto>
* .morse decodificar <código>
`;
    await sock.sendMessage(from, { text: usage });
  }
}

