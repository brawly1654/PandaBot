export const command = 'usecreditos';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const user = sender.split('@')[0];

  if (!global.cmDB[user]) {
    global.cmDB[user] = {
      spins: 5,
      coins: 0,
      shields: 0,
      villageLevel: 1,
      creditos: 0
    };
  }

  const data = global.cmDB[user];

  if (!args[0]) {
    const menu = `
🎫 *Tienda de Créditos* 🎫

Puedes usar tus créditos para comprar:

1️⃣ .usecreditos giro [cantidad] — (15 créditos c/u)
2️⃣ .usecreditos escudo [cantidad] — (40 créditos c/u, máx. 2 escudos)
3️⃣ .usecreditos monedas [cantidad] — (10 créditos = 5,000 monedas)

🪙 Monedas: ${data.coins}
🛡 Escudos: ${data.shields}
🎰 Giros: ${data.spins}
🎫 Créditos: ${data.creditos}
`.trim();
    await sock.sendMessage(from, { text: menu }, { quoted: msg });
    return;
  }

  const tipo = args[0].toLowerCase();
  const cantidad = Math.max(1, parseInt(args[1]) || 1);

  let costo = 0;
  let mensaje = '';

  switch (tipo) {
    case 'giro':
    case 'giros':
    case 'spin':
    case 'spins':
      costo = cantidad * 15;
      if (data.creditos < costo) {
        mensaje = `❌ No tienes suficientes créditos. Necesitas *${costo}* créditos para ${cantidad} giro(s).`;
        break;
      }
      data.creditos -= costo;
      data.spins += cantidad;
      mensaje = `🎰 Has comprado *${cantidad} giro(s)* por *${costo} créditos*.`;
      break;

    case 'escudo':
    case 'escudos':
      costo = cantidad * 40;
      if (data.creditos < costo) {
        mensaje = `❌ No tienes suficientes créditos. Necesitas *${costo}* créditos para ${cantidad} escudo(s).`;
        break;
      } else if (data.shields + cantidad > 2) {
        mensaje = `⚠️ Solo puedes tener un máximo de 2 escudos. Tienes actualmente: ${data.shields}.`;
        break;
      }
      data.creditos -= costo;
      data.shields += cantidad;
      mensaje = `🛡 Has comprado *${cantidad} escudo(s)* por *${costo} créditos*.`;
      break;

    case 'moneda':
    case 'monedas':
    case 'coin':
    case 'coins':
      costo = cantidad * 10;
      const monedasGanadas = cantidad * 5000;
      if (data.creditos < costo) {
        mensaje = `❌ No tienes suficientes créditos. Necesitas *${costo}* créditos para ${monedasGanadas.toLocaleString()} monedas.`;
        break;
      }
      data.creditos -= costo;
      data.coins += monedasGanadas;
      mensaje = `🪙 Has comprado *${monedasGanadas.toLocaleString()} monedas* por *${costo} créditos*.`;
      break;

    default:
      mensaje = `❌ Opción no válida. Usa *.usecreditos* para ver el menú.`;
      break;
  }

  global.guardarCM();
  await sock.sendMessage(from, { text: mensaje }, { quoted: msg });
}
