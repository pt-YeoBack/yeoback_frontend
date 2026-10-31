import { useEffect, useState } from 'react';

/** 목표 시각까지 남은 시간(ms)을 1초 단위로 갱신해 돌려준다. */
export function useCountdown(target: number | null): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!target) return undefined;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [target]);
  if (!target) return 0;
  return Math.max(0, target - now);
}

export function formatMMSS(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
