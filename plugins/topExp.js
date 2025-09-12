import { cargarDatabase } from '../data/database.js';

export const command = 'topExp';

export async function run(sock,msg) {
  const from=msg.key.remoteJid;
  const db=cargarDatabase(); db.users=db.users||{};
  const top=Object.entries(db.users)
   .map(([id,u])=>({id,exp:u.exp||0}))
   .sort((a,b)=>b.exp-a.exp).slice(0,10);
  let text='🏆 *Top 10 experiencia*\n';
  top.forEach((u,i)=>{text+=`\n${i+1}. ${u.id.split('@')[0]}: ${u.exp} exp`;});
  await sock.sendMessage(from,{text});
}
