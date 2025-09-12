// Archivo: utils/vip.js

import { cargarDatabase, guardarDatabase } from '../data/database.js';

export function isVip(userJid) {
  const db = cargarDatabase();
  const user = db.users[userJid];

  if (!user || !user.vip) {
    return false;
  }
  
  const now = Date.now();
  if (now > user.vipExpiration) {
    // El VIP ha expirado, lo removemos
    user.vip = false;
    delete user.vipExpiration;
    guardarDatabase(db);
    return false;
  }

  return true;
}

