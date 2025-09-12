export const command = 'configmenu';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  const menu = `
⚙️ *Menú de Configuración de PandaBot* ⚙️

Puedes usar los comandos:
.enable <función>
.disable <función>

📌 Funciones disponibles:

✅ *modoadmin* — Solo admins o owner pueden usar comandos en grupos.
✅ *antilink* — Elimina usuarios que envíen cualquier tipo de link en grupos.
✅ *modoowner* — Solo el owner puede usar el bot (afecta a todo).
✅ *grupos* — Activa/desactiva el bot en grupos.
✅ *chatsprivados* — Activa/desactiva el bot en chats privados.

Ejemplos:
.enable antilink
.disable modoadmin

⚙️ *Recuerda*: 
- Las opciones "modoowner", "grupos" y "chatsprivados" se manejan globalmente y puedes cambiarlas desde el chat privado con el bot.
- "antilink" y "modoadmin" funcionan por grupo, y debes configurarlas desde dentro del grupo.
`;

  await sock.sendMessage(from, { text: menu }, { quoted: msg });
}
