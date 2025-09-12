export const command = 'recolectar';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderID = sender.split('@')[0];

  // === Cooldown: 1 hora (3600000 ms) ===
  const cooldownTiempo = 3600000;
  if (!global.recolectarCooldown) global.recolectarCooldown = {};
  const ultimoUso = global.recolectarCooldown[senderID] || 0;

  if (Date.now() - ultimoUso < cooldownTiempo) {
    const tiempoRestante = cooldownTiempo - (Date.now() - ultimoUso);
    const minutos = Math.ceil(tiempoRestante / 60000);
    return await sock.sendMessage(from, { 
      text: `🕒 Debes esperar *${minutos} minuto(s)* antes de volver a recolectar.` 
    }, { quoted: msg });
  }

  // Guardar momento actual como último uso
  global.recolectarCooldown[senderID] = Date.now();

  // === Inicialización del jugador si no existe ===
  if (!global.cmDB[senderID]) {
    global.cmDB[senderID] = {
      spins: 5,
      coins: 0,
      shields: 0,
      villageLevel: 1,
      lastDaily: 0,
      recursos: {
        madera: 0, piedra: 0, hierro: 0, oro: 0, rubi: 0, esmeralda: 0, diamante: 0,
        perla: 0, cristal: 0, cuero: 0, pescado: 0, trigo: 0, manzana: 0, carbón: 0,
        obsidiana: 0, reliquia: 0, artefacto: 0, gemaOscura: 0, vino: 0, agua: 0,
        tabaco: 0, incienso: 0, hueso: 0, tela: 0, cactus: 0, sal: 0, cacao: 0,
        piel: 0, escama: 0, maderaOscura: 0, piedraRúnica: 0, flor: 0, pergamino: 0
      }
    };
  }

  // === Seleccionar 3 recursos aleatorios ===
  const recursosGanados = {};
  const recursos = Object.keys(global.cmDB[senderID].recursos);

  for (let i = 0; i < 3; i++) {
    const recurso = recursos[Math.floor(Math.random() * recursos.length)];
    const cantidad = Math.floor(Math.random() * 5) + 1;
    global.cmDB[senderID].recursos[recurso] += cantidad;
    recursosGanados[recurso] = (recursosGanados[recurso] || 0) + cantidad;
  }

  // Guardar base de datos
  global.guardarCM();

  // === Mensaje de resultado ===
  let texto = `⛏️ *Has recolectado:*\n`;
  for (const [recurso, cantidad] of Object.entries(recursosGanados)) {
    texto += `- ${cantidad} ${recurso}\n`;
  }

  await sock.sendMessage(from, { text: texto }, { quoted: msg });
}
