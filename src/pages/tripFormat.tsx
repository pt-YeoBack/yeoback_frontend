/** Mobile 11~22에서 여행 정보를 같은 형식으로 보여 주기 위한 도우미 */
import type { Destination } from '../lib/destinations';
import { nightsDays } from '../lib/dates';
import { getSessionUser } from '../lib/testAuthService';
import { peopleCount, Trip } from '../lib/tripStore';

/** "2026.11.09 – 11.13" */
export function tripDateRange(trip: Trip, sep = ' – '): string {
  if (!trip.startDate || !trip.endDate) return '날짜 미정';
  const [y, m, d] = trip.startDate.split('-');
  const [y2, m2, d2] = trip.endDate.split('-');
  return `${y}.${m}.${d}${sep}${y2 !== y ? `${y2}.` : ''}${m2}.${d2}`;
}

/** "4박 5일 · 김서연, 민준 · 2명" */
export function tripPeopleLine(trip: Trip): string {
  const me = getSessionUser()?.name ?? '나';
  const names = [me, ...trip.companions.map((c) => c.name)].filter(Boolean);
  const shown = names.length > 3 ? `${names.slice(0, 3).join(', ')} 외 ${names.length - 3}명` : names.join(', ');
  const nd = trip.startDate && trip.endDate ? `${nightsDays(trip.startDate, trip.endDate)} · ` : '';
  return `${nd}${shown} · ${peopleCount(trip)}명`;
}

/** "김서연, 민준과 함께" */
export function withWhom(trip: Trip): string {
  const me = getSessionUser()?.name ?? '나';
  const names = [me, ...trip.companions.map((c) => c.name)].filter(Boolean);
  if (names.length === 1) return '혼자 떠나는 여행';
  const last = names[names.length - 1];
  const hasBatchim = (last.charCodeAt(last.length - 1) - 0xac00) % 28 !== 0;
  return `${names.join(', ')}${hasBatchim ? '과' : '와'} 함께`;
}

export function DestinationThumb({ destination, className }: { destination: Destination | null; className?: string }) {
  if (destination?.photo) return <img className={className} src={destination.photo} alt="" />;
  const [a, b] = destination?.tint ?? ['var(--sky-200)', 'var(--brand-700)'];
  return (
    <span className={`${className ?? ''} destination-placeholder`} style={{ background: `linear-gradient(135deg, var(--dest-a, ${a}), var(--dest-b, ${b}))` }}>
      {destination?.city ?? '여행지 미정'}
    </span>
  );
}

/** 여행지 시간대 안내 (Figma Mobile 12: "현지 JST · 한국과 같은 UTC+9") */
export function timezoneLine(destination: Destination | null): string {
  const map: Record<string, string> = {
    tokyo: '현지 JST · 한국과 같은 UTC+9',
    osaka: '현지 JST · 한국과 같은 UTC+9',
    fukuoka: '현지 JST · 한국과 같은 UTC+9',
    taipei: '현지 CST · 한국보다 1시간 느림',
    danang: '현지 ICT · 한국보다 2시간 느림',
    bangkok: '현지 ICT · 한국보다 2시간 느림',
    paris: '현지 CET · 한국보다 8시간 느림(서머타임 7시간)',
  };
  if (!destination) return '현지 시간';
  if (destination.region === 'domestic') return '한국 시간';
  return map[destination.id] ?? '현지 시간 · 시차는 직접 확인해 주세요';
}
