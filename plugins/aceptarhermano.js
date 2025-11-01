import fs from 'fs';

const file = './data/hermandad.json';

function cargarHermandad() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '{}');
  return JSON.parse(fs.readFileSync(file));
}

function guardarHermandad(hermandad) {
  fs.writeFileSync(file, JSON.stringify(hermandad, null, 2));
}

function agregarHermano(hermandad, u1, u2) {
  if (!hermandad[u1]) {
    hermandad[u1] = [];
  }
  if (!hermandad[u1].includes(u2)) {
    hermandad[u1].push(u2);
  }
}

export const command = 'aceptarhermano';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const user = msg.key.participant || msg.key.remoteJid;
  
  const hermandad = cargarHermandad();
  
  const solicitudesKey = `solicitud_${user}`;
  const solicitudes = hermandad[solicitudesKey];

  if (!solicitudes || solicitudes.length === 0) {
    await sock.sendMessage(from, { text: '❌ No tienes ninguna solicitud de hermandad pendiente.' });
    return;
  }

  let nuevosHermanos = [];
  let hermanosAdquiridos = [];

  for (const solicitante of solicitudes) {
    if (hermandad[user]?.includes(solicitante) || hermandad[solicitante]?.includes(user)) {
      continue;
    }

    agregarHermano(hermandad, user, solicitante);
    agregarHermano(hermandad, solicitante, user);
    nuevosHermanos.push(solicitante);

    const hermanosDelSolicitante = hermandad[solicitante].filter(id => id !== user);
    const hermanosDelAceptante = hermandad[user].filter(id => id !== solicitante);
    
    for (const hermanoAntiguo of hermanosDelSolicitante) {
        if (!hermandad[user].includes(hermanoAntiguo)) {
            agregarHermano(hermandad, user, hermanoAntiguo);
            agregarHermano(hermandad, hermanoAntiguo, user);
            hermanosAdquiridos.push(hermanoAntiguo);
        }
    }

    const listaParaPropagar = [solicitante, ...hermanosDelSolicitante];

    for (const personaPropagar of listaParaPropagar) {
        for (const hermanoNuevo of hermanosDelAceptante) {
            if (!hermandad[personaPropagar].includes(hermanoNuevo)) {
                agregarHermano(hermandad, personaPropagar, hermanoNuevo);
                agregarHermano(hermandad, hermanoNuevo, personaPropagar);
                hermanosAdquiridos.push(hermanoNuevo);
            }
        }
    }
  }

  delete hermandad[solicitudesKey];
  guardarHermandad(hermandad);
  
  if (nuevosHermanos.length === 0) {
      await sock.sendMessage(from, { text: '❌ No tenías solicitudes válidas pendientes (o ya eran hermanos).' });
      return;
  }
  
  const nuevosHermanosText = nuevosHermanos.map(id => `<@${id.split('@')[0]}>`).join(', ');
  let mensajeAdicional = '';

  const hermanosAdquiridosUnicos = [...new Set(hermanosAdquiridos.filter(id => ![...nuevosHermanos, user].includes(id)))];
  
  if (hermanosAdquiridosUnicos.length > 0) {
      const adquiridosText = hermanosAdquiridosUnicos.map(id => `<@${id.split('@')[0]}>`).join(', ');
      mensajeAdicional = `\n\n🎉 ¡Además, todos habéis adquirido nuevos hermanos/as por extensión!: ${adquiridosText}`;
  }

  const allMentions = [...nuevosHermanos, user, ...hermanosAdquiridosUnicos];

  await sock.sendMessage(from, {
    text: `🫂 ¡Ahora sois hermanos/as!\n\n**Tú** (<@${user.split('@')[0]}>) y **${nuevosHermanos.length > 1 ? 'los siguientes' : 'el siguiente'}**: ${nuevosHermanosText}.` + mensajeAdicional,
    mentions: allMentions
  });
}

