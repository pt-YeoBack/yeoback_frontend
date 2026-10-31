/**
 * Mobile 11~22 공통 부품
 * - Avatar, Switch, ChoiceChips, MiniMap(지도 모양 데모), RailList(읽기 전용 타임라인), DemoBadge
 */
import { ReactNode, useState } from 'react';
import puppyAvatar from '../assets/avatar-puppy.png';
import { locate } from './icons';

// ---------------------------------------------------------------------------
// 아바타 (닉네임 첫 글자 · 예시 캐릭터 · 직접 올린 사진)
// ---------------------------------------------------------------------------

export function Avatar({
  nickname,
  avatar = 'initial',
  size = 70,
  solid = false,
  icon,
}: {
  nickname: string;
  avatar?: string;
  size?: number;
  solid?: boolean;
  icon?: string;
}) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.4) };
  if (icon) {
    return (
      <span className={`avatar ${solid ? 'is-solid' : ''}`} style={style} aria-hidden="true">
        <img src={icon} alt="" width={18} height={18} />
      </span>
    );
  }
  if (avatar !== 'initial') {
    const src = avatar === 'puppy' ? puppyAvatar : avatar;
    return <img className="avatar avatar-photo" src={src} alt="" style={style} />;
  }
  return (
    <span className={`avatar ${solid ? 'is-solid' : ''}`} style={style} aria-hidden="true">
      {nickname.trim().charAt(0) || '?'}
    </span>
  );
}

// ---------------------------------------------------------------------------
// 스위치 (Mobile 22 세부 설정)
// ---------------------------------------------------------------------------

export function Switch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button type="button" role="switch" aria-checked={checked} className="switch-row" onClick={() => onChange(!checked)}>
      <span className="switch-text">
        <strong>{label}</strong>
        {description && <span>{description}</span>}
      </span>
      <span className={`switch ${checked ? 'is-on' : ''}`} aria-hidden="true">
        <span />
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// 선택 칩 묶음 (단일/복수 선택)
// ---------------------------------------------------------------------------

export function ChoiceChips<T extends string>({
  label,
  options,
  selected,
  onToggle,
  multiple = true,
  variant = 'solid',
}: {
  label: string;
  options: readonly T[];
  selected: readonly T[];
  onToggle: (v: T) => void;
  multiple?: boolean;
  /** solid: 선택 시 진한 남색(Mobile 13) · soft: 선택 시 연한 파랑(Mobile 22) */
  variant?: 'solid' | 'soft';
}) {
  return (
    <div className={`choice-chips choice-${variant}`} role={multiple ? 'group' : 'radiogroup'} aria-label={label}>
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            role={multiple ? undefined : 'radio'}
            aria-pressed={multiple ? on : undefined}
            aria-checked={multiple ? undefined : on}
            className={`choice-chip ${on ? 'is-on' : ''}`}
            onClick={() => onToggle(o)}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 지도 모양 데모 (실제 지도 API 아님)
// ---------------------------------------------------------------------------

export interface MapStop {
  id: string;
  x: number; // 0~100
  y: number;
  label: string;
  /** 숫자 핀(일정 순서) / 클로버 핀(모임) / 점(현재 위치) / 추천 핀 */
  kind: 'stop' | 'gathering' | 'me' | 'pick';
  num?: number;
  active?: boolean;
  onSelect?: () => void;
}

const BLOCKS = [
  [6, 8, 16, 14], [30, 8, 16, 14], [56, 8, 16, 14], [80, 8, 16, 14],
  [6, 32, 16, 14], [30, 32, 16, 14], [56, 32, 16, 14], [80, 32, 16, 14],
  [6, 56, 16, 14], [30, 56, 16, 14], [56, 56, 16, 14], [80, 56, 16, 14],
  [6, 80, 16, 14], [30, 80, 16, 14], [56, 80, 16, 14], [80, 80, 16, 14],
];

/**
 * 전체 화면 지도(Mobile 16)용 거리 모양 — 세로로 긴 화면에서도 블록이 늘어나 보이지 않게
 * viewBox 100×150 를 화면에 맞춰 잘라 쓴다(slice). 실제 지도가 아니라 모양만 나타낸 예시.
 */
const FULL_COLS = [0, 24, 50, 76, 100];
const FULL_ROWS = [0, 22, 46, 70, 96, 122, 150];
const FULL_BLOCKS: [number, number, number, number][] = (() => {
  const out: [number, number, number, number][] = [];
  const g = 3; // 길 폭의 절반
  for (let r = 0; r < FULL_ROWS.length - 1; r++) {
    for (let c = 0; c < FULL_COLS.length - 1; c++) {
      // 왼쪽 아래 두 칸은 공원
      if (c === 0 && r >= 4) continue;
      const x0 = FULL_COLS[c] + g;
      const y0 = FULL_ROWS[r] + g;
      const w = FULL_COLS[c + 1] - FULL_COLS[c] - g * 2;
      const h = FULL_ROWS[r + 1] - FULL_ROWS[r] - g * 2;
      // 칸마다 건물 2~4개로 나눠 실제 동네처럼
      const split = (r + c) % 3;
      if (split === 0) {
        out.push([x0, y0, w, h]);
      } else if (split === 1) {
        out.push([x0, y0, w * 0.48, h], [x0 + w * 0.54, y0, w * 0.46, h]);
      } else {
        const hw = w * 0.47;
        const hh = h * 0.45;
        out.push([x0, y0, hw, hh], [x0 + w - hw, y0, hw, hh], [x0, y0 + h - hh, hw, hh], [x0 + w - hw, y0 + h - hh, hw, hh]);
      }
    }
  }
  return out;
})();

function FullMapBase() {
  return (
    <svg className="mini-map-base" viewBox="0 0 100 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x="0" y="0" width="100" height="150" className="map-land" />
      <path d="M0 99 H24 V150 H0 Z" className="map-park" />
      <circle cx="11" cy="118" r="4" className="map-park-dot" />
      <circle cx="16" cy="134" r="3" className="map-park-dot" />
      {FULL_BLOCKS.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx={1.6} className="map-block" />
      ))}
      {/* 큰길(대각선) · 물길 · 철길 */}
      <path d="M58 -2 C 64 40, 74 80, 98 152" className="map-road-major-edge" />
      <path d="M58 -2 C 64 40, 74 80, 98 152" className="map-road-major" />
      <path d="M-2 70 C 20 66, 40 76, 60 70 S 90 64, 102 72" className="map-water" />
      <path d="M88 0 C 84 40, 94 70, 86 104 S 88 136, 90 150" className="map-rail" />
    </svg>
  );
}

export function MiniMap({
  stops,
  labels = [],
  route = false,
  height = 250,
  caption,
  onLocate,
  variant = 'card',
  children,
}: {
  stops: MapStop[];
  labels?: { x: number; y: number; text: string; tone?: 'blue' | 'gray' }[];
  /** 숫자 핀을 선으로 잇기 (Mobile 13 도보 추천 경로) */
  route?: boolean;
  height?: number | string;
  caption?: string;
  onLocate?: () => void;
  /** card: 둥근 카드 지도 · full: 화면을 꽉 채우는 지도(Mobile 16) */
  variant?: 'card' | 'full';
  children?: ReactNode;
}) {
  const [zoom, setZoom] = useState(1);
  const ordered = stops.filter((s) => s.kind === 'stop' || s.kind === 'pick').sort((a, b) => (a.num ?? 0) - (b.num ?? 0));
  return (
    <figure className={`mini-map-wrap ${variant === 'full' ? 'is-full' : ''}`}>
    <div className="mini-map" style={{ height }}>
      <div className="mini-map-canvas" style={{ transform: `scale(${zoom})` }}>
        {variant === 'full' ? (
          <FullMapBase />
        ) : (
        <svg className="mini-map-base" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {BLOCKS.map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y} width={w} height={h} rx={2.5} className="map-block" />
          ))}
          <path d="M88 0 C 84 30, 92 50, 86 70 S 88 90, 90 100" className="map-rail" />
          {route && ordered.length > 1 && (
            <polyline points={ordered.map((s) => `${s.x},${s.y}`).join(' ')} className="map-route" />
          )}
        </svg>
        )}
        {labels.map((l) => (
          <span key={l.text} className={`map-label map-label-${l.tone ?? 'gray'}`} style={{ left: `${l.x}%`, top: `${l.y}%` }}>
            {l.text}
          </span>
        ))}
        {stops.map((s) => {
          const content =
            s.kind === 'me' ? (
              <span className="map-me" />
            ) : s.kind === 'gathering' ? (
              <span className="map-gathering" />
            ) : (
              <span className={`map-stop ${s.kind === 'pick' ? 'is-pick' : ''}`}>{s.num}</span>
            );
          const style = { left: `${s.x}%`, top: `${s.y}%` };
          return s.onSelect ? (
            <button
              key={s.id}
              type="button"
              className={`map-pin ${s.active ? 'is-active' : ''}`}
              style={style}
              onClick={s.onSelect}
              aria-label={s.label}
              aria-pressed={s.active}
            >
              {content}
              {s.kind !== 'me' && s.kind !== 'pick' && <span className="map-pin-label">{s.label}</span>}
            </button>
          ) : (
            <span key={s.id} className="map-pin" style={style} title={s.label}>
              {content}
              {s.kind !== 'me' && s.kind !== 'pick' && <span className="map-pin-label">{s.label}</span>}
            </span>
          );
        })}
      </div>
      {onLocate && (
        <button type="button" className="map-locate" onClick={onLocate} aria-label="현재 위치로 이동">
          <img src={locate} alt="" width={40} height={40} />
        </button>
      )}
      <span className="map-north" aria-hidden="true">
        N ↑
      </span>
      <div className="map-zoom" role="group" aria-label="지도 확대·축소">
        <button type="button" onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.2).toFixed(1)))} aria-label="확대" disabled={zoom >= 1.6}>
          +
        </button>
        <button type="button" onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(1)))} aria-label="축소" disabled={zoom <= 1}>
          −
        </button>
      </div>
      {children}
    </div>
      {caption && <figcaption className="map-caption">{caption}</figcaption>}
    </figure>
  );
}

// ---------------------------------------------------------------------------
// 읽기 전용 타임라인 (Mobile 12·15)
// ---------------------------------------------------------------------------

export interface RailItem {
  id: string;
  time: string;
  title: string;
  sub?: string;
  photo?: string;
  note?: string;
  highlight?: boolean;
  onSelect?: () => void;
}

export function RailList({ items, compact = false }: { items: RailItem[]; compact?: boolean }) {
  return (
    <ol className={`time-rail rail-readonly ${compact ? 'is-compact' : ''}`}>
      {items.map((it, i) => (
        <li key={it.id} className="rail-group">
          <div className="rail-event">
            <div className="rail-marker" aria-hidden="true">
              <span className="rail-time">{it.time}</span>
              <span className="rail-stop">{i + 1}</span>
              <span className="rail-line" />
            </div>
            {it.onSelect ? (
              <button type="button" className={`activity-card rail-card ${it.highlight ? 'is-highlight' : ''}`} onClick={it.onSelect}>
                <RailCardBody it={it} />
              </button>
            ) : (
              <div className={`activity-card rail-card ${it.highlight ? 'is-highlight' : ''}`}>
                <RailCardBody it={it} />
              </div>
            )}
          </div>
          {it.note && <p className="rail-note">{it.note}</p>}
        </li>
      ))}
    </ol>
  );
}

function RailCardBody({ it }: { it: RailItem }) {
  return (
    <>
      {it.photo && <img className="rail-thumb" src={it.photo} alt="" width={48} height={54} />}
      <span className="activity-body">
        <span className="sr-only">{it.time} · </span>
        <strong>{it.title}</strong>
        {it.sub && <span>{it.sub}</span>}
      </span>
    </>
  );
}

export function DemoBadge({ children = '데모' }: { children?: ReactNode }) {
  return <span className="demo-badge">{children}</span>;
}
