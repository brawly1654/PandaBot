let startTime = Date.now();

export function getUptime() {
  const now = Date.now();
  const diff = now - startTime;
  
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  let result = '';
  if (days > 0) result += `${days} día(s), `;
  if (hours > 0) result += `${hours} hora(s), `;
  if (minutes > 0) result += `${minutes} minuto(s), `;
  result += `${seconds} segundo(s).`;
  
  return result;
}

