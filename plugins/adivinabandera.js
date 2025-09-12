import { loadWins, saveWins, loadCooldowns, saveCooldowns } from '../utils/banderas_db.js';

export const command = 'adivinabandera';

const COOLDOWN_MINUTOS = 0;
const INTENTOS_MAXIMOS = 3;

const banderas = [
  { pais: 'afganistan', emoji: '🇦🇫' },
  { pais: 'albania', emoji: '🇦🇱' },
  { pais: 'alemania', emoji: '🇩🇪' },
  { pais: 'andorra', emoji: '🇦🇩' },
  { pais: 'angola', emoji: '🇦🇴' },
  { pais: 'argentina', emoji: '🇦🇷' },
  { pais: 'australia', emoji: '🇦🇺' },
  { pais: 'austria', emoji: '🇦🇹' },
  { pais: 'bahamas', emoji: '🇧🇸' },
  { pais: 'bangladesh', emoji: '🇧🇩' },
  { pais: 'belgica', emoji: '🇧🇪' },
  { pais: 'bolivia', emoji: '🇧🇴' },
  { pais: 'brasil', emoji: '🇧🇷' },
  { pais: 'bulgaria', emoji: '🇧🇬' },
  { pais: 'canada', emoji: '🇨🇦' },
  { pais: 'chile', emoji: '🇨🇱' },
  { pais: 'china', emoji: '🇨🇳' },
  { pais: 'colombia', emoji: '🇨🇴' },
  { pais: 'corea del sur', emoji: '🇰🇷' },
  { pais: 'costa rica', emoji: '🇨🇷' },
  { pais: 'croacia', emoji: '🇭🇷' },
  { pais: 'cuba', emoji: '🇨🇺' },
  { pais: 'dinamarca', emoji: '🇩🇰' },
  { pais: 'ecuador', emoji: '🇪🇨' },
  { pais: 'egipto', emoji: '🇪🇬' },
  { pais: 'españa', emoji: '🇪🇸' },
  { pais: 'estados unidos', emoji: '🇺🇸' },
  { pais: 'estonia', emoji: '🇪🇪' },
  { pais: 'filipinas', emoji: '🇵🇭' },
  { pais: 'finlandia', emoji: '🇫🇮' },
  { pais: 'francia', emoji: '🇫🇷' },
  { pais: 'grecia', emoji: '🇬🇷' },
  { pais: 'guatemala', emoji: '🇬🇹' },
  { pais: 'haiti', emoji: '🇭🇹' },
  { pais: 'holanda', emoji: '🇳🇱' },
  { pais: 'honduras', emoji: '🇭🇳' },
  { pais: 'hungria', emoji: '🇭🇺' },
  { pais: 'india', emoji: '🇮🇳' },
  { pais: 'indonesia', emoji: '🇮🇩' },
  { pais: 'irlanda', emoji: '🇮🇪' },
  { pais: 'islandia', emoji: '🇮🇸' },
  { pais: 'israel', emoji: '🇮🇱' },
  { pais: 'italia', emoji: '🇮🇹' },
  { pais: 'jamaica', emoji: '🇯🇲' },
  { pais: 'japon', emoji: '🇯🇵' },
  { pais: 'luxemburgo', emoji: '🇱🇺' },
  { pais: 'mexico', emoji: '🇲🇽' },
  { pais: 'noruega', emoji: '🇳🇴' },
  { pais: 'nueva zelanda', emoji: '🇳🇿' },
  { pais: 'panama', emoji: '🇵🇦' },
  { pais: 'paraguay', emoji: '🇵🇾' },
  { pais: 'peru', emoji: '🇵🇪' },
  { pais: 'polonia', emoji: '🇵🇱' },
  { pais: 'portugal', emoji: '🇵🇹' },
  { pais: 'reino unido', emoji: '🇬🇧' },
  { pais: 'republica checa', emoji: '🇨🇿' },
  { pais: 'rumania', emoji: '🇷🇴' },
  { pais: 'rusia', emoji: '🇷🇺' },
  { pais: 'serbia', emoji: '🇷🇸' },
  { pais: 'singapur', emoji: '🇸🇬' },
  { pais: 'suecia', emoji: '🇸🇪' },
  { pais: 'suiza', emoji: '🇨🇭' },
  { pais: 'tailandia', emoji: '🇹🇭' },
  { pais: 'turquia', emoji: '🇹🇷' },
  { pais: 'ucrania', emoji: '🇺🇦' },
  { pais: 'uruguay', emoji: '🇺🇾' },
  { pais: 'venezuela', emoji: '🇻🇪' },
  { pais: 'vietnam', emoji: '🇻🇳' },
  { pais: 'argelia', emoji: '🇩🇿' },
  { pais: 'armenia', emoji: '🇦🇲' },
  { pais: 'azerbaiyan', emoji: '🇦🇿' },
  { pais: 'bahrein', emoji: '🇧🇭' },
  { pais: 'bielorrusia', emoji: '🇧🇾' },
  { pais: 'bosnia y herzegovina', emoji: '🇧🇦' },
  { pais: 'botsuana', emoji: '🇧🇼' },
  { pais: 'brunei', emoji: '🇧🇳' },
  { pais: 'burkina faso', emoji: '🇧🇫' },
  { pais: 'cabo verde', emoji: '🇨🇻' },
  { pais: 'camboya', emoji: '🇰🇭' },
  { pais: 'camerun', emoji: '🇨🇲' },
  { pais: 'chad', emoji: '🇹🇩' },
  { pais: 'chipre', emoji: '🇨🇾' },
  { pais: 'ciudad del vaticano', emoji: '🇻🇦' },
  { pais: 'comoras', emoji: '🇰🇲' },
  { pais: 'congo', emoji: '🇨🇬' },
  { pais: 'corea del norte', emoji: '🇰🇵' },
  { pais: 'costa de marfil', emoji: '🇨🇮' },
  { pais: 'djibouti', emoji: '🇩🇯' },
  { pais: 'dominica', emoji: '🇩🇲' },
  { pais: 'el salvador', emoji: '🇸🇻' },
  { pais: 'emiratos arabes unidos', emoji: '🇦🇪' },
  { pais: 'eritrea', emoji: '🇪🇷' },
  { pais: 'eslovenia', emoji: '🇸🇮' },
  { pais: 'etiopia', emoji: '🇪🇹' },
  { pais: 'fiyi', emoji: '🇫🇯' },
  { pais: 'gabón', emoji: '🇬🇦' },
  { pais: 'gambia', emoji: '🇬🇲' },
  { pais: 'georgia', emoji: '🇬🇪' },
  { pais: 'ghana', emoji: '🇬🇭' },
  { pais: 'guinea', emoji: '🇬🇳' },
  { pais: 'guinea ecuatorial', emoji: '🇬🇶' },
  { pais: 'guinea-bisau', emoji: '🇬🇼' },
  { pais: 'guyana', emoji: '🇬🇾' },
  { pais: 'kazajistan', emoji: '🇰🇿' },
  { pais: 'kenia', emoji: '🇰🇪' },
  { pais: 'kirguistan', emoji: '🇰🇬' },
  { pais: 'kiribati', emoji: '🇰🇮' },
  { pais: 'kosovo', emoji: '🇽🇰' },
  { pais: 'kuwait', emoji: '🇰🇼' },
  { pais: 'laos', emoji: '🇱🇦' },
  { pais: 'letonia', emoji: '🇱🇻' },
  { pais: 'libano', emoji: '🇱🇧' },
  { pais: 'liberia', emoji: '🇱🇷' },
  { pais: 'libia', emoji: '🇱🇾' },
  { pais: 'liechtenstein', emoji: '🇱🇮' },
  { pais: 'lituania', emoji: '🇱🇹' },
  { pais: 'madagascar', emoji: '🇲🇬' },
  { pais: 'malasia', emoji: '🇲🇾' },
  { pais: 'malawi', emoji: '🇲🇼' },
  { pais: 'maldivas', emoji: '🇲🇻' },
  { pais: 'mali', emoji: '🇲🇱' },
  { pais: 'malta', emoji: '🇲🇹' },
  { pais: 'marruecos', emoji: '🇲🇦' },
  { pais: 'mauricio', emoji: '🇲🇺' },
  { pais: 'mauritania', emoji: '🇲🇷' },
  { pais: 'micronesia', emoji: '🇫🇲' },
  { pais: 'moldavia', emoji: '🇲🇩' },
  { pais: 'mongolia', emoji: '🇲🇳' },
  { pais: 'montenegro', emoji: '🇲🇪' },
  { pais: 'mozambique', emoji: '🇲🇿' },
  { pais: 'namibia', emoji: '🇳🇦' },
  { pais: 'nepal', emoji: '🇳🇵' },
  { pais: 'nicaragua', emoji: '🇳🇮' },
  { pais: 'niger', emoji: '🇳🇪' },
  { pais: 'nigeria', emoji: '🇳🇬' },
  { pais: 'oman', emoji: '🇴🇲' },
  { pais: 'pakistan', emoji: '🇵🇰' },
  { pais: 'palaos', emoji: '🇵🇼' },
  { pais: 'palestina', emoji: '🇵🇸' },
  { pais: 'papua nueva guinea', emoji: '🇵🇬' },
  { pais: 'qatar', emoji: '🇶🇦' },
  { pais: 'ruanda', emoji: '🇷🇼' },
  { pais: 'samoa', emoji: '🇼🇸' },
  { pais: 'san marino', emoji: '🇸🇲' },
  { pais: 'santa lucia', emoji: '🇱🇨' },
  { pais: 'santo tome y principe', emoji: '🇸🇹' },
  { pais: 'senegal', emoji: '🇸🇳' },
  { pais: 'seychelles', emoji: '🇸🇨' },
  { pais: 'siria', emoji: '🇸🇾' },
  { pais: 'somalia', emoji: '🇸🇴' },
  { pais: 'sri lanka', emoji: '🇱🇰' },
  { pais: 'sudafrica', emoji: '🇿🇦' },
  { pais: 'sudan', emoji: '🇸🇩' },
  { pais: 'surinam', emoji: '🇸🇷' },
  { pais: 'swazilandia', emoji: '🇸🇿' },
  { pais: 'tadjikistan', emoji: '🇹🇯' },
  { pais: 'tanzania', emoji: '🇹🇿' },
  { pais: 'timor oriental', emoji: '🇹🇱' },
  { pais: 'togo', emoji: '🇹🇬' },
  { pais: 'tonga', emoji: '🇹🇴' },
  { pais: 'trinidad y tobago', emoji: '🇹🇹' },
  { pais: 'tunez', emoji: '🇹🇳' },
  { pais: 'turkmenistan', emoji: '🇹🇲' },
  { pais: 'uganda', emoji: '🇺🇬' },
  { pais: 'uzbekistan', emoji: '🇺🇿' },
  { pais: 'vanuatu', emoji: '🇻🇺' },
  { pais: 'yemen', emoji: '🇾🇪' },
  { pais: 'zambia', emoji: '🇿🇲' },
  { pais: 'zimbabue', emoji: '🇿🇼' }
];

export async function run(sock, msg, args) {
  try {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    const cooldowns = loadCooldowns();
    const now = Date.now();
    const lastTime = cooldowns[sender] || 0;
    const remaining = Math.ceil((lastTime + COOLDOWN_MINUTOS * 60000 - now) / 1000);

    if (remaining > 0) {
      await sock.sendMessage(from, { text: `⏳ Debes esperar ${Math.ceil(remaining / 60)} min para volver a jugar.` });
      return;
    }

    const bandera = banderas[Math.floor(Math.random() * banderas.length)];
    cooldowns[sender] = now;
    saveCooldowns(cooldowns);

    await sock.sendMessage(from, { text: `🌍 *¡Adivina la bandera!* ${bandera.emoji}\nTienes ${INTENTOS_MAXIMOS} intentos.` });

    let intentos = 0;

    const listener = async ({ messages }) => {
      for (const respuesta of messages) {
        if (!respuesta.message) continue;
        const respuestaSender = respuesta.key.participant || respuesta.key.remoteJid;

        if (respuesta.key.fromMe) continue;
        if (respuesta.key.remoteJid !== from) continue;
        if (respuestaSender !== sender) continue;

        const texto = (respuesta.message?.conversation 
          || respuesta.message?.extendedTextMessage?.text 
          || '').toLowerCase().trim();

        intentos++;

        if (texto === bandera.pais.toLowerCase()) {
          const wins = loadWins();
          wins[sender] = (wins[sender] || 0) + 1;
          saveWins(wins);
          await sock.sendMessage(from, { text: `✅ ¡Correcto! Era *${bandera.pais}*.\n🏆 Total victorias: ${wins[sender]}` });
          sock.ev.off('messages.upsert', listener);
          break;
        } else if (intentos < INTENTOS_MAXIMOS) {
          await sock.sendMessage(from, { text: `❌ Incorrecto. Te quedan ${INTENTOS_MAXIMOS - intentos} intentos.` });
        } else {
          await sock.sendMessage(from, { text: `❌ Fallaste. La respuesta correcta era *${bandera.pais}*.` });
          sock.ev.off('messages.upsert', listener);
          break;
        }
      }
    };

    sock.ev.on('messages.upsert', listener);

  } catch (e) {
    console.error('❌ Error en adivinabandera:', e);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Error ejecutando el comando. Intenta de nuevo.' });
  }
}
