/**
 * Helpers de fecha/hora locales para Bolivia (America/La_Paz, UTC-4)
 *
 * IMPORTANTE: SQLite guarda CURRENT_TIMESTAMP en UTC (siempre, sin importar TZ).
 * Por eso NO usamos DEFAULT CURRENT_TIMESTAMP para campos que se muestran/filtran;
 * en su lugar pasamos explícitamente la fecha/hora local calculada en JS, donde
 * process.env.TZ = 'America/La_Paz' (definido en server.js) sí tiene efecto.
 *
 * Requiere: process.env.TZ = 'America/La_Paz' seteado en backend/server.js
 */

// Devuelve "YYYY-MM-DD HH:MM:SS" en hora local Bolivia
const getLocalDateTime = () => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

// Devuelve "YYYY-MM-DD" en hora local Bolivia
const getLocalDate = () => {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

module.exports = { getLocalDateTime, getLocalDate }
