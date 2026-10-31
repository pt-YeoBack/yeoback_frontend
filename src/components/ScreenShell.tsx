import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';
import { backIcons, moreIcons, statusIcons, Tone } from './icons';

interface ScreenShellProps {
  /** Figma 프레임 이름 (디버깅·테스트용 data 속성) */
  frame: string;
  tone: Tone;
  /** 상단 내비게이션 제목. 없으면 내비게이션 바를 그리지 않음 */
  title?: string;
  onBack?: () => void;
  backLabel?: string;
  menu?: { label: string; onSelect: () => void }[];
  /** 제목 아래 작은 보조 문구 (Mobile 09·10: "1 / 2 · 목적지와 날짜") */
  subtitle?: string;
  /** 오른쪽 버튼을 직접 지정 (Mobile 08~10의 알림 종 아이콘). 지정하면 menu 대신 표시 */
  trailing?: ReactNode;
  /** 뒤로 가기 자리 자체를 비움 (Mobile 08 홈처럼 제목이 왼쪽 끝에서 시작하는 화면) */
  noBackSlot?: boolean;
  /** 하단 탭 바 (Mobile 08~10) */
  bottomNav?: ReactNode;
  surface?: 'white' | 'mist';
  children: ReactNode;
  contentClassName?: string;
  /** 화면 단위 CSS 변수 (프로필 액센트 컬러 조합) */
  style?: CSSProperties;
}

/**
 * 모든 화면의 공통 틀: 상태 표시줄(데스크톱 미리보기에서만) + 내비게이션 + 본문 + 홈 인디케이터.
 * 실제 휴대폰 화면 폭에서는 기기의 상태 표시줄을 쓰므로 가짜 상태 표시줄을 숨깁니다.
 */
export function ScreenShell({
  frame,
  tone,
  title,
  onBack,
  backLabel = '뒤로 가기',
  menu,
  subtitle,
  trailing,
  noBackSlot,
  bottomNav,
  surface = 'white',
  children,
  contentClassName,
  style,
}: ScreenShellProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const status = statusIcons[tone];

  useEffect(() => {
    // 화면이 바뀌면 스크린리더 사용자를 위해 제목으로 초점을 옮긴다.
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [frame]);

  return (
    <div className={`screen tone-${tone} surface-${surface} ${bottomNav ? 'has-bottom-nav' : ''}`} data-frame={frame} style={style}>
      <div className="status-bar" aria-hidden="true">
        <span className="status-time">9:41</span>
        <span className="status-icons">
          <img src={status.signal} alt="" width={18} height={18} />
          <img src={status.wifi} alt="" width={18} height={18} />
          <img src={status.battery} alt="" width={26} height={18} />
        </span>
      </div>

      {title !== undefined && (
        <header className="nav-bar">
          {onBack ? (
            <button type="button" className="nav-back" onClick={() => onBack()} aria-label={backLabel}>
              <img src={backIcons[tone]} alt="" width={22} height={22} />
            </button>
          ) : noBackSlot ? null : (
            <span className="nav-back" aria-hidden="true" />
          )}
          <div className="nav-heading">
            <h1 className="nav-title" ref={headingRef} tabIndex={-1}>
              {title}
            </h1>
            {subtitle && <p className="nav-subtitle">{subtitle}</p>}
          </div>
          {trailing ?? (menu && menu.length > 0 ? <MoreMenu tone={tone} items={menu} /> : <span className="nav-more" />)}
        </header>
      )}

      <main className={`screen-content ${contentClassName ?? ''}`}>{children}</main>

      {bottomNav}

      <div className="home-safe-area" aria-hidden="true">
        <span className="home-indicator" />
      </div>
    </div>
  );
}

function MoreMenu({ tone, items }: { tone: Tone; items: { label: string; onSelect: () => void }[] }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return;
      if (e instanceof MouseEvent && wrapRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className="nav-more-wrap" ref={wrapRef}>
      <button
        type="button"
        className="nav-more"
        aria-label="더보기"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <img src={moreIcons[tone]} alt="" width={21} height={21} />
      </button>
      {open && (
        <ul className="more-menu" role="menu">
          {items.map((item) => (
            <li key={item.label} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
