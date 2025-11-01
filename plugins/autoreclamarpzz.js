import { autoReclaim } from "../PandaLove/pizzeria.js";
import { isVip } from "../utils/vip.js";

export const command = 'autoreclamarpzz';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

    if (!isVip(sender)) {
      await sock.sendMessage(from, { text: '❌ Este comando es solo para usuarios VIP.' });
      return;
    }

  const loadingMsg = await sock.sendMessage(from, { text: `⏳ Alternando tu sistema de auto-ganancias...` });

  try {
    const response = await autoReclaim(sender);

    if (response.number !== 200) {
      await sock.sendMessage(from, { text: `*❌ Error al reclamar, asegúrate de tener una pizzeria registrada.${response.error}*` }, { quoted: loadingMsg });
      return;
    }

    const { state } = response;

    await sock.sendMessage(
      from,
      {
        text: state
          ? "✅ Sistema de auto-ganancias **activado correctamente**. Ahora empezarás a recibir coins de tu pizzería automáticamente. 🍕💰"
          : "🛑 Sistema de auto-ganancias **desactivado**. Ya no recibirás coins automáticos hasta que lo vuelvas a activar. ❌"
      },
      { quoted: loadingMsg }
    );
   } catch (error) {
  console.error('❌ Error al conectar con la API de la pizzería:', error);
  await sock.sendMessage(from, { text: `*❌ Hubo un error de conexión con la API de la pizzería. Inténtalo más tarde.*` });
  }
}
