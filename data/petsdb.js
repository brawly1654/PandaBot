import fs from 'fs';
import path from 'path';

const petsDBPath = path.resolve('./data/pets.json');

export const cargarPetsDB = () => {
  if (!fs.existsSync(petsDBPath)) {
    fs.writeFileSync(petsDBPath, '{}');
  }
  return JSON.parse(fs.readFileSync(petsDBPath, 'utf8'));
};

export const guardarPetsDB = (data) => {
  fs.writeFileSync(petsDBPath, JSON.stringify(data, null, 2));
};

