import fs from 'fs/promises';

export const command = 'addpokemonall';
const OWNER_ID = '56953508566';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];
  if (sender !== OWNER_ID) {
    return sock.sendMessage(from, { text: '❌ Puedes usar este comando solamente tú (owner).' });
  }

  const urlAll = 'https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0';
  let pokeList;
  try {
    const res = await fetch(urlAll);
    const data = await res.json();
    pokeList = data.results;
  } catch (err) {
    return sock.sendMessage(from, { text: '❌ Error al obtener lista de Pokémon.' });
  }

  try {
    const file = await fs.readFile('./data/personajes.json', 'utf8');
    const db = JSON.parse(file);
    const existNames = new Set(db.characters.map(p => p.nombre.toLowerCase()));

    for (const { name } of pokeList) {
      if (existNames.has(name.toLowerCase())) continue;

      const id = parseInt(name.match(/\d+/)?.[0]) || 0;
      let calidad = 'común';
      let precio = 300;
      if (id > 800) { calidad = 'Ultra-Legendario'; precio = 10000; }
      else if (id > 600) { calidad = 'legendario'; precio = 7000; }
      else if (id > 400) { calidad = 'mítico'; precio = 4800; }
      else if (id > 200) { calidad = 'épico'; precio = 1700; }
      else if (id > 100) { calidad = 'raro'; precio = 800; }

      db.characters.push({
        nombre: name,
        calidad,
        precio,
        descripcion: `Pokémon oficial: ${name}`
      });

      existNames.add(name.toLowerCase());
    }

    await fs.writeFile('./data/personajes.json', JSON.stringify(db, null, 2));
    await sock.sendMessage(from, { text: `✅ Se agregaron ${pokeList.length} Pokémon (sin duplicados). Reinicia el bot si es necesario.` });
  } catch (err) {
    console.error(err);
    await sock.sendMessage(from, { text: '❌ Error al modificar personajes.' });
  }
}
