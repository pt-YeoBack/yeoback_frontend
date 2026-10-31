import { ReactNode, useEffect, useId, useRef } from 'react';
import { useAppState } from '../lib/appState';
import { Route, useNav } from '../lib/navigation';
import { bell, calendarDays, clover, house, userRound } from './icons';

// ---------------------------------------------------------------------------
// 하단 탭 바 (Figma "Bottom navigation")
// ---------------------------------------------------------------------------

type TabKey = 'home' | 'schedule' | 'connections' | 'profile';

/** 탭마다 루트 화면 (탭을 누르면 그 화면부터 기록을 새로 시작) */
const TAB_ROOT: Record<TabKey, Route['name']> = {
  home: 'home',
  schedule: 'schedules',
  connections: 'connections',
  profile: 'profile',
};

export function BottomNav({ active }: { active: TabKey }) {
  const { reset, route } = useNav();

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'home', label: '홈', icon: house },
    { key: 'schedule', label: '일정', icon: calendarDays },
    { key: 'connections', label: '인연', icon: clover },
    { key: 'profile', label: '프로필', icon: userRound },
  ];

  const select = (key: TabKey) => {
    const root = TAB_ROOT[key];
    if (route.name === root) return;
    reset({ name: root } as Route);
  };

  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`bottom-tab ${active === t.key ? 'is-active' : ''}`}
          aria-current={active === t.key ? 'page' : undefined}
          onClick={() => select(t.key)}
        >
          <img src={t.icon} alt="" width={24} height={24} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

export function BellButton() {
  const { showToast } = useAppState();
  return (
    <button
      type="button"
      className="nav-more"
      aria-label="알림"
      onClick={() => showToast('새 알림이 없어요. (알림 기능은 준비 중이에요)')}
    >
      <img src={bell} alt="" width={21} height={21} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// 바텀 시트 & 확인 대화상자 (Figma에 없는 보조 UI — 입력·확인용으로 추가)
// ---------------------------------------------------------------------------

export function BottomSheet({
  title,
  onClose,
  children,
  footer,
  placement = 'bottom',
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** bottom: 아래에서 올라오는 시트 · center: 화면 가운데 대화상자 */
  placement?: 'bottom' | 'center';
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const first = panelRef.current?.querySelector<HTMLElement>(
      'input, select, textarea, button:not([data-sheet-close])',
    );
    (first ?? panelRef.current)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`sheet-backdrop ${placement === 'center' ? 'is-center' : ''}`} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`sheet ${placement === 'center' ? 'is-center' : ''}`} role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panelRef} tabIndex={-1}>
        <div className="sheet-header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="닫기" data-sheet-close>
            ×
          </button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = '취소',
  danger,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <BottomSheet
      title={title}
      onClose={onCancel}
      footer={
        <div className="sheet-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={`btn-primary ${danger ? 'btn-danger' : ''}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      }
    >
      <p className="sheet-message">{message}</p>
    </BottomSheet>
  );
}
