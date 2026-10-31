import { ReactNode, RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { chevronLeft20, chevronRight20 } from './icons';

/**
 * Day 탭 줄 (Mobile 10 · 15 · 21 공용)
 * 날짜가 많아 화면보다 길어지면 양옆 여백을 유지한 채 가로로 스크롤되고,
 * 넘친 쪽에만 흐림 효과와 화살표 버튼을 보여 준다. (2026-10-24 피드백 반영 · Figma에 없는 화살표는 임의 추가)
 */
export function DayTabStrip({
  label,
  listRef,
  children,
}: {
  label: string;
  listRef?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const ownRef = useRef<HTMLDivElement>(null);
  const ref = listRef ?? ownRef;
  const [edges, setEdges] = useState({ left: false, right: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const left = el.scrollLeft > 2;
    const right = el.scrollLeft < max - 2;
    // 값이 같으면 상태를 바꾸지 않아 렌더가 반복되지 않게
    setEdges((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener('scroll', update, { passive: true });
    // 마우스 휠(세로)로도 가로 스크롤 — 데스크톱에서 넘친 날짜를 보기 쉽게. 끝에 닿으면 페이지 스크롤로 넘김
    const onWheel = (e: WheelEvent) => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if ((e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max - 1)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', update);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', update);
      ro?.disconnect();
    };
  }, [ref, update]);

  // 자식(날짜 수)이 바뀌면 다시 계산
  useEffect(() => {
    update();
  });

  const scrollByPage = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(120, el.clientWidth * 0.7), behavior: 'smooth' });
  };

  return (
    <div className={`day-strip ${edges.left ? 'has-left' : ''} ${edges.right ? 'has-right' : ''}`}>
      <div className="day-tabs" role="tablist" aria-label={label} ref={ref}>
        {children}
      </div>
      {edges.left && (
        <button type="button" className="day-strip-arrow is-left" aria-label="앞 날짜 더 보기" onClick={() => scrollByPage(-1)}>
          <img src={chevronLeft20} alt="" width={16} height={16} />
        </button>
      )}
      {edges.right && (
        <button type="button" className="day-strip-arrow is-right" aria-label="뒤 날짜 더 보기" onClick={() => scrollByPage(1)}>
          <img src={chevronRight20} alt="" width={16} height={16} />
        </button>
      )}
    </div>
  );
}
