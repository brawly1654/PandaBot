// cartasactuales.js
import { getName, formatHand } from './carioca.js';

export const command = 'cartasactuales';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  // Este comando se asocia a una partida por grupo
  if (from.endsWith('@s.whatsapp.net')) {
    return sock.sendMessage(from, {
      text: '❌ Este comando se usa *en el grupo* donde se está jugando Carioca.'
    });
  }

  const game = global.cariocaGames?.[from];
  if (!game || game.estado !== 'Jugando') {
    return sock.sendMessage(from, { text: '❌ No hay una partida de Carioca en curso en este grupo.' });
  }

  const player = game.jugadores.find(p => p.jid === sender);
  if (!player) {
    return sock.sendMessage(from, { text: '❌ No estás en esta partida.' });
  }

  // 1) Enviar la mano *por privado* al jugador (no al grupo)
  const manoStr = formatHand(player.mano);
  await sock.sendMessage(sender, {
    text: `*Tus cartas — Ronda ${game.rondaActual}: ${game.contrato}*\n${manoStr}`
  });

  // 2) Construir tablero público (grupo): solo info pública
  const juegosBajadosStr = game.jugadores
    .filter(p => (p.juegosBajados?.length || 0) > 0)
    .map(p => {
      const juegosStr = p.juegosBajados
        .map((j, i) => `   - Juego ${i + 1}: ${formatHand(j)}`)
        .join('\n');
      return `*ID ${p.id} - ${p.nombre}:*\n${juegosStr}`;
    })
    .join('\n\n');

  const pozoStr = game.pozo ? formatHand([game.pozo]) : 'Vacío';
  const turnoName = getName(sock, game.turnoDe);

  // Si tu motor de turnos setea game.turnoTimestamp, mostramos segundos restantes
  let restante = '';
  if (typeof game.turnoTimestamp === 'number') {
    const secs = Math.max(0, Math.ceil((game.turnoTimestamp - Date.now()) / 1000));
    if (secs > 0) restante = ` (${secs}s restantes)`;
  }

  const groupMsg =
`*TABLERO DE CARIOCA — Ronda ${game.rondaActual}: ${game.contrato}*

🃏 *Juegos bajados:*
${juegosBajadosStr || 'Nadie ha bajado juegos aún.'}

🗑️ *Pozo (visible):* ${pozoStr}
⏳ *Turno:* ${turnoName}${restante}

📩 *${getName(sock, sender)}*, te envié tu mano por privado.`;

  return sock.sendMessage(from, { text: groupMsg });
}
