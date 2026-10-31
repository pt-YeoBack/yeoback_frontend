/**
 * 컬러 조합(프로필 액센트)을 앱 전체에 적용
 * 1) :root 에 CSS 변수를 덮어써 글자 · 버튼 · 위젯 · 테두리 · 배경 톤을 바꾸고
 * 2) 남색(#244790 등)으로 그려진 SVG 아이콘을 조합 색으로 다시 칠하고
 * 3) 파란 3D 일러스트(메일 · 문자 · 캐리어 · 온보딩 그림 · data-tint 표시)는 파란 픽셀만 조합 색으로 색조를 옮긴다.
 * 아이콘은 <img> 라서 CSS로 색을 바꿀 수 없어 사본 이미지를 만든다. (추가 라이브러리 없이 브라우저 기본 API만 사용)
 */
import { accentVars, paletteOf } from './accent';

const BRAND_STROKES = [/#244790/gi, /#20668c/gi, /#203b69/gi, /#244b73/gi];
// 아이콘 안의 옅은 파랑(#84afff · 로고 경로 #77bff0 등)은 조합의 선명한 톤 쪽으로
const LIGHT_STROKES = [/#84afff/gi, /#77bff0/gi];
const PALE_FILLS = [/#c3d8ff/gi, /#dce8ff/gi];

interface ThemeColors {
  strong: string;
  vivid: string;
  pale: string;
  /** 래스터 일러스트 색조를 옮길 목표 색상(hue, 0~360)과 채도 배율 */
  hue: number;
  sat: number;
}

let current: ThemeColors | null = null;
let observer: MutationObserver | null = null;
const svgText = new Map<string, Promise<string | null>>();
const generated = new Map<string, Promise<string | null>>();
const generatedSet = new Set<string>();

function isSvg(src: string) {
  return src.startsWith('data:image/svg+xml') || /\.svg(\?|#|$)/i.test(src);
}

function loadSvg(src: string): Promise<string | null> {
  let p = svgText.get(src);
  if (!p) {
    if (src.startsWith('data:image/svg+xml')) {
      const comma = src.indexOf(',');
      const meta = src.slice(0, comma);
      const body = src.slice(comma + 1);
      try {
        p = Promise.resolve(meta.includes(';base64') ? atob(body) : decodeURIComponent(body));
      } catch {
        p = Promise.resolve(null);
      }
    } else {
      p = fetch(src)
        .then((r) => (r.ok ? r.text() : null))
        .catch(() => null);
    }
    svgText.set(src, p);
  }
  return p;
}

function recolorSvg(original: string, t: ThemeColors): Promise<string | null> {
  return loadSvg(original).then((text) => {
    if (!text) return null;
    const all = [...BRAND_STROKES, ...LIGHT_STROKES, ...PALE_FILLS];
    if (!all.some((r) => ((r.lastIndex = 0), r.test(text)))) return null;
    let out = text;
    BRAND_STROKES.forEach((r) => (out = out.replace(r, t.strong)));
    LIGHT_STROKES.forEach((r) => (out = out.replace(r, t.vivid)));
    PALE_FILLS.forEach((r) => (out = out.replace(r, t.pale)));
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(out)}`;
  });
}

// ---- 래스터 일러스트 색조 이동 -------------------------------------------------

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}

function hexHue(hex: string): [number, number] {
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16);
  const [h, s] = rgbToHsl(n(1), n(3), n(5));
  return [h, s];
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src;
  });
}

/** 파란 계열(색상 185~255°) 픽셀만 목표 색상으로 옮기고 밝기는 그대로 둔다 → 흰 배경 · 그림자는 유지 */
async function tintRaster(original: string, t: ThemeColors): Promise<string | null> {
  const im = await loadImage(original);
  if (!im || !im.naturalWidth) return null;
  try {
    const c = document.createElement('canvas');
    c.width = im.naturalWidth;
    c.height = im.naturalHeight;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(im, 0, 0);
    const data = ctx.getImageData(0, 0, c.width, c.height);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      const [h, s, l] = rgbToHsl(px[i], px[i + 1], px[i + 2]);
      if (s < 0.08 || h < 185 || h > 255) continue;
      // 원래 파랑 안에서의 색 차이(215° 기준)는 살려 입체감 유지
      const nh = (t.hue + (h - 215) * 0.6 + 360) % 360;
      const [r, g, b] = hslToRgb(nh, Math.min(1, s * t.sat), l);
      px[i] = r;
      px[i + 1] = g;
      px[i + 2] = b;
    }
    ctx.putImageData(data, 0, 0);
    return c.toDataURL(/\.png|image\/png/i.test(original) ? 'image/png' : 'image/jpeg', 0.92);
  } catch {
    return null; // 캔버스를 읽을 수 없는 이미지(다른 출처)는 원본 유지
  }
}

// ---- 공통 ---------------------------------------------------------------------

function restore(img: HTMLImageElement) {
  const o = img.dataset.iconSrc;
  if (!o) return;
  delete img.dataset.iconSrc;
  if (img.getAttribute('src') !== o) img.setAttribute('src', o);
}

async function paint(img: HTMLImageElement) {
  const original = img.dataset.iconSrc ?? img.getAttribute('src') ?? '';
  const raster = img.hasAttribute('data-tint');
  if (!original || (!raster && !isSvg(original))) return;
  if (!current) {
    restore(img);
    return;
  }
  const theme = current;
  const key = `${original}|${theme.strong}|${theme.vivid}|${theme.hue}`;
  let job = generated.get(key);
  if (!job) {
    job = (raster && !isSvg(original) ? tintRaster(original, theme) : recolorSvg(original, theme)).then((u) => {
      if (u) generatedSet.add(u);
      return u;
    });
    generated.set(key, job);
  }
  const url = await job;
  if (!url || current !== theme) return; // 바꿀 색이 없거나 그사이 조합이 바뀜
  if (img.dataset.iconSrc && img.dataset.iconSrc !== original) return; // 그사이 다른 이미지로 바뀜
  img.dataset.iconSrc = original;
  if (img.getAttribute('src') !== url) img.setAttribute('src', url);
}

function scan(root: ParentNode) {
  root.querySelectorAll?.('img').forEach((img) => void paint(img as HTMLImageElement));
}

function ensureObserver() {
  if (observer || typeof MutationObserver === 'undefined') return;
  observer = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'attributes' && r.target instanceof HTMLImageElement) {
        const src = r.target.getAttribute('src') ?? '';
        if (generatedSet.has(src)) continue;
        // React가 새 이미지로 바꿨으면 그 이미지를 원본으로 다시 기억
        if (r.target.dataset.iconSrc && src !== r.target.dataset.iconSrc) r.target.dataset.iconSrc = src;
        void paint(r.target);
      } else {
        r.addedNodes.forEach((n) => {
          if (n instanceof HTMLImageElement) void paint(n);
          else if (n instanceof Element) scan(n);
        });
      }
    }
  });
  observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
}

const VAR_NAMES = Object.keys(accentVars('#000000') ?? {});
const DEVICE_KEY = 'yeobaek.accent.device';

/** 로그아웃 상태 화면(로그인 · 인증 메일 등)에도 이 기기에서 마지막으로 고른 조합을 쓰도록 기억 */
export function rememberDeviceAccent(id: string | undefined) {
  try {
    if (id) window.localStorage.setItem(DEVICE_KEY, id);
  } catch {
    /* 저장소를 쓸 수 없으면 기억하지 않음 */
  }
}

export function deviceAccent(): string | undefined {
  try {
    return window.localStorage.getItem(DEVICE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function applyTheme(accentId: string | undefined | null) {
  const root = document.documentElement;
  const vars = accentId ? accentVars(accentId) : null;
  VAR_NAMES.forEach((k) => root.style.removeProperty(k));
  if (vars) Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.dataset.accent = vars ? paletteOf(accentId ?? undefined).id : 'sky';

  if (vars) {
    const p = paletteOf(accentId ?? undefined);
    const [hue, s] = hexHue(p.vivid);
    current = { strong: p.bridge, vivid: p.vivid, pale: p.mid, hue, sat: Math.max(0.55, Math.min(1.1, s / 0.75)) };
    ensureObserver();
  } else {
    current = null;
  }
  scan(document);
}
