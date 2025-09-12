import { cargarDatabase } from '../data/database.js';

export const command = 'topPandacoins';

export async function run(sock,msg) {
  const from=msg.key.remoteJid;
  const db=cargarDatabase(); db.users=db.users||{};
  const top=Object.entries(db.users)
   .map(([id,u])=>({id,coins:u.pandacoins||0}))
   .sort((a,b)=>b.coins-a.coins).slice(0,10);
  let text='🐼 *Top 10 usuarios con más Pandacoins*\n';
  top.forEach((u,i)=>{text+=`\n${i+1}. ${u.id.split('@')[0]}: ${u.coins} pandacoins`;});
  await sock.sendMessage(from,{text});
}
