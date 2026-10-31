/** 날짜는 시간대 문제를 피하려고 'YYYY-MM-DD' 문자열로 다룬다. */
export type ISODate = string;

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function toISO(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISO(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): ISODate {
  return toISO(new Date());
}

export function addDays(iso: ISODate, n: number): ISODate {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function daysBetween(a: ISODate, b: ISODate): number {
  return Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86_400_000);
}

export function dateRange(start: ISODate, end: ISODate): ISODate[] {
  const out: ISODate[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
  return out;
}

export function weekday(iso: ISODate): string {
  return WEEKDAYS[fromISO(iso).getDay()];
}

/** 11.09 월 */
export function formatMDW(iso: ISODate): string {
  const d = fromISO(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${weekday(iso)}`;
}

/** 11.9 (Day 탭) */
export function formatShort(iso: ISODate): string {
  const d = fromISO(iso);
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

/** 4박 5일 */
export function nightsDays(start: ISODate, end: ISODate): string {
  const nights = daysBetween(start, end);
  return nights === 0 ? '당일치기' : `${nights}박 ${nights + 1}일`;
}

export interface MonthCell {
  iso: ISODate | null;
  day: number | null;
}

/** 일요일 시작 달력의 주 단위 칸 */
export function monthGrid(year: number, month: number): MonthCell[][] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: MonthCell[] = [];
  for (let i = 0; i < first.getDay(); i += 1) cells.push({ iso: null, day: null });
  for (let d = 1; d <= daysInMonth; d += 1) cells.push({ iso: toISO(new Date(year, month, d)), day: d });
  while (cells.length % 7 !== 0) cells.push({ iso: null, day: null });
  const weeks: MonthCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export const WEEKDAY_LABELS = WEEKDAYS;
