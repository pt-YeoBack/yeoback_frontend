/**
 * Mobile 22 "컬러 조합 선택" — 파스텔 컬러 조합 (Figma 견본 283:307~315, 2026-10-26 갱신본)
 *
 * 원칙: 기본 조합은 Figma의 메인 블루 그대로. 다른 조합을 고르면 글자 · 버튼 · 위젯 · 아이콘 · 지도까지
 *       파란 계열이 남지 않도록 모두 조합 색(다리 색 · 파스텔)으로 바꾼다.
 *  - swatch : Figma 견본 3색 (왼→오른, 1/3씩)
 *  - soft   : 가장 옅은 배경 (카드 · 시트 바탕)
 *  - mid    : 선택된 탭 · 칩 배경
 *  - extra  : 보조 배경 (페이지 바탕 · 지도 블록에 살짝)
 *  - accent : 아이콘 · 지도 핀 · 동선 · 강조 버튼 — 파스텔과 어울리면서 흰 바탕에서 4.5:1 이상 읽히는 진한 톤
 */

export interface AccentPalette {
  id: string;
  label: string;
  swatch: [string, string, string];
  /** 가장 옅은 배경 — 큰 카드 · 칩 바탕 */
  soft: string;
  /** 선택된 탭 · 강조 칩 바탕 */
  mid: string;
  /** 세 번째 색 — AI · 안내 카드와 페이지 바탕에 살짝 */
  extra: string;
  /** 다리 색: 조합 색과 메인 블루(#244790)를 섞은 진한 톤 — 보조 글자 · 아이콘 · 선택 상태 · 지도 핀 */
  bridge: string;
  /** 지도 동선처럼 선 하나로 눈에 띄어야 하는 곳의 선명한 톤 */
  vivid: string;
}

/**
 * 다리 색(bridge)은 각 조합의 선명한 톤을 메인 블루와 7:3으로 섞어 만들었다.
 * 파란 글자와 파스텔 바탕 사이를 이어 줘서, 한 화면에 색이 따로 놀지 않는다. 모두 흰 바탕 대비 5.9:1 이상.
 */
// 2026-10-26 피드백: 노란 계열(레몬 · 크림 · 피치)은 바탕이 누렇게 보여 시선을 흩뜨리므로 조합에서 뺐다.
//   Figma 견본의 셋째 색 중 노란 계열은 같은 조합 안에서 어울리는 차가운 파스텔로 바꿈.
export const ACCENT_PALETTES: AccentPalette[] = [
  // 1번(기본): Figma 화면 색 그대로
  { id: 'sky', label: '블루 · 라벤더 (기본)', swatch: ['#d7e8ff', '#c7d2fe', '#f3e8ff'], soft: '#d7e8ff', mid: '#c7d2fe', extra: '#f3e8ff', bridge: '#244790', vivid: '#2f6bff' },
  { id: 'aqua', label: '하늘 · 아쿠아 · 핑크', swatch: ['#e3f2fd', '#b2fffc', '#fce4ec'], soft: '#e3f2fd', mid: '#b2fffc', extra: '#fce4ec', bridge: '#206b8d', vivid: '#1f9bb0' },
  { id: 'blossom', label: '벚꽃 · 로즈 · 라일락', swatch: ['#fce4ec', '#ffd6e0', '#f3e8ff'], soft: '#fce4ec', mid: '#ffd6e0', extra: '#f3e8ff', bridge: '#864776', vivid: '#d05a85' },
  { id: 'lavender', label: '라벤더 · 오키드 · 페리윙클', swatch: ['#f3e8ff', '#e1bee7', '#e8eaf6'], soft: '#f3e8ff', mid: '#e1bee7', extra: '#e8eaf6', bridge: '#614d9f', vivid: '#9a62d1' },
  { id: 'mint', label: '민트 · 그린 · 아쿠아', swatch: ['#e8f5e9', '#c8e6c9', '#e0f2f1'], soft: '#e8f5e9', mid: '#c8e6c9', extra: '#e0f2f1', bridge: '#2c6d60', vivid: '#3c9a5f' },
];

export const DEFAULT_ACCENT = 'sky';

const hexToRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgbToHex = (c: number[]) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (h: string, to: number, t: number) => rgbToHex(hexToRgb(h).map((v) => v + (to - v) * t));
const lum = (h: string) => {
  const [r, g, b] = hexToRgb(h).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** '+' 칩에서 고른 직접 색(#rrggbb) → 파스텔 조합. 아이콘 색은 흰 바탕 대비 4.5:1 이상이 될 때까지 어둡게 */
export function customPalette(hex: string): AccentPalette {
  let vivid = hex;
  for (let t = 0; t <= 1 && 1.05 / (lum(vivid) + 0.05) < 3; t += 0.05) vivid = mix(hex, 0, t);
  // 메인 블루와 7:3으로 섞은 뒤, 흰 바탕 대비 4.5:1 이상이 될 때까지 어둡게
  let bridge = rgbToHex(hexToRgb(vivid).map((v, i) => v * 0.7 + hexToRgb('#244790')[i] * 0.3));
  for (let t = 0; t <= 1 && 1.05 / (lum(bridge) + 0.05) < 4.5; t += 0.05) bridge = mix(bridge, 0, 0.05);
  const soft = mix(hex, 255, 0.85);
  const mid = mix(hex, 255, 0.65);
  const extra = mix(hex, 255, 0.92);
  return { id: hex, label: `직접 고른 색 ${hex}`, swatch: [soft, mid, extra], soft, mid, extra, bridge, vivid };
}

export function isCustomAccent(id: string) {
  return /^#[0-9a-f]{6}$/i.test(id);
}

export function paletteOf(id: string | undefined): AccentPalette {
  if (id && isCustomAccent(id)) return customPalette(id.toLowerCase());
  return ACCENT_PALETTES.find((p) => p.id === id) ?? ACCENT_PALETTES[0];
}

/**
 * 앱 전체에 얹는 CSS 변수. 기본 조합이면 null → tokens.css 값 그대로(Figma 색).
 * 글자 · 버튼 · 위젯 · 아이콘 · 지도까지 모두 조합 색으로 바꾼다. (기본 조합은 Figma의 메인 블루)
 */
export function accentVars(id: string | undefined): Record<string, string> | null {
  const p = paletteOf(id);
  if (p.id === DEFAULT_ACCENT) return null;
  const mixW = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, #ffffff)`;
  const mixC = (a: string, pct: number, b: string) => `color-mix(in srgb, ${a} ${pct}%, ${b})`;
  return {
    // 글자 · 버튼 · 위젯: 모두 조합의 다리 색 (2026-10-26 피드백 — 파란 버튼이 남지 않게)
    '--brand-900': mixC(p.bridge, 82, '#000000'),
    '--brand-700': p.bridge,
    '--brand-600': p.bridge,
    '--gathering-text': p.bridge,
    '--placeholder': mixW(p.bridge, 45),
    // 선택 상태(탭 · 스위치 · 칩 · 내 말풍선 · 점 등)
    '--select': p.bridge,
    // 테두리 · 구분선: 중간 파스텔에 다리 색을 조금
    '--brand-300': mixC(p.bridge, 30, p.mid),
    // 배경 톤 — 세 색을 역할별로 나눠 써서 조합이 화면에 함께 보이게
    '--brand-50': p.soft,
    '--sky-100': p.soft,
    '--mist-100': mixW(p.soft, 70),
    '--sky-200': p.mid,
    '--sky-300': mixW(p.mid, 60),
    '--sky-150': mixW(p.extra, 80),
    '--sky-50': mixW(p.extra, 55),
    '--slate-50': mixW(p.extra, 40),
    '--surface': mixW(p.extra, 22),
    // 아이콘 · 강조 버튼 · 지도
    '--accent-blue': p.bridge,
    '--pin': p.bridge,
    '--map-route': p.vivid,
    '--map-bg': mixW(p.soft, 55),
    '--map-block': mixW(p.mid, 50),
    // 사진이 없는 여행지 자리 표시 그라디언트
    '--dest-a': p.mid,
    '--dest-b': p.bridge,
  };
}

export function swatchGradient(s: [string, string, string]) {
  return `linear-gradient(90deg, ${s[0]} 0 33.33%, ${s[1]} 33.33% 66.67%, ${s[2]} 66.67% 100%)`;
}
