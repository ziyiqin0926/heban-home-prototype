export function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function findInitialScheduleDate(today: Date, scheduleKeys: string[]) {
  const todayKey = formatDateKey(today);
  const nearestKey = scheduleKeys
    .filter(key => key >= todayKey)
    .sort()[0] || todayKey;
  const [year, month, day] = nearestKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}
