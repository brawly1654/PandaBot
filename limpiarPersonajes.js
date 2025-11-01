import fs from "fs";

export function limpiarPersonajes(ruta = "./data/personajes.json") {
  // Leer archivo
  const data = JSON.parse(fs.readFileSync(ruta, "utf8"));
  const personajes = data.characters || [];

  // Usamos un Map para eliminar repetidos por el nombre
  const mapa = new Map();
  for (const personaje of personajes) {
    if (personaje?.nombre) {
      mapa.set(personaje.nombre.toLowerCase(), personaje);
    }
  }

  // Convertimos el mapa a arreglo nuevamente
  const personajesLimpios = Array.from(mapa.values());

  // Guardamos el archivo
  const dataLimpia = { characters: personajesLimpios };
  fs.writeFileSync(ruta, JSON.stringify(dataLimpia, null, 2), "utf8");

  return personajesLimpios;
}
