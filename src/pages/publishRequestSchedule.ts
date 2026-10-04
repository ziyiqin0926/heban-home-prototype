export interface UpcomingDate {
  value: string;
  label: string;
  dateLabel: string;
  weekday: string;
}

export const servicePeriods = [
  { id: 'morning', label: '上午', slots: ['09:00', '10:00', '11:30'] },
  { id: 'afternoon', label: '下午', slots: ['13:30', '14:00', '15:30', '17:00'] },
  { id: 'night', label: '夜间', slots: ['18:30', '20:00', '21:30'] },
] as const;

const toDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function getUpcomingDates(now = new Date(), count = 7): UpcomingDate[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + index);
    const label = index === 0 ? '今天' : index === 1 ? '明天' : index === 2 ? '后天' : '';
    return {
      value: toDateValue(date),
      label,
      dateLabel: `${date.getMonth() + 1}月${date.getDate()}日`,
      weekday: `周${'日一二三四五六'[date.getDay()]}`,
    };
  });
}

export function getVisibleDates(dates: UpcomingDate[], expanded: boolean, initialCount = 3): UpcomingDate[] {
  return expanded ? dates : dates.slice(0, initialCount);
}

export function getDateValueMonthsLater(now: Date, months: number): string {
  const targetMonth = new Date(now.getFullYear(), now.getMonth() + months + 1, 0);
  const day = Math.min(now.getDate(), targetMonth.getDate());
  return toDateValue(new Date(now.getFullYear(), now.getMonth() + months, day));
}
