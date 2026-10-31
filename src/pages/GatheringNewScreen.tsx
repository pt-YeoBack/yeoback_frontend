import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { BellButton, BottomNav, ConfirmDialog } from '../components/TripParts';
import { camera } from '../components/icons';
import { useAppState } from '../lib/appState';
import { addDays, formatMDW, todayISO } from '../lib/dates';
import { useNav } from '../lib/navigation';
import { tripDates, useTrips } from '../lib/tripStore';
import { GatheringKind, useWorld } from '../lib/worldStore';

const MAX_PHOTOS = 10;
const DRAFT_KEY = 'yeobaek.gatheringDraft';

interface Form {
  photos: string[];
  title: string;
  description: string;
  kind: GatheringKind | null;
  distance: '근처' | '다른 지역' | null;
  maxPeople: string;
  place: string;
  date: string;
  start: string;
  end: string;
}

const EMPTY: Form = {
  photos: [],
  title: '',
  description: '',
  kind: null,
  distance: null,
  maxPeople: '',
  place: '',
  date: '',
  start: '',
  end: '',
};

function readDraft(): Form {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Form>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function formatTime(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d;
}
const validTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

/** 사진을 작게 줄여 data URL로 (localStorage 용량 보호) */
function shrink(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode'));
      img.onload = () => {
        const scale = Math.min(1, 480 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.72));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/** Mobile 18 (두 번째 프레임) · 모임 만들기 */
export function GatheringNewScreen() {
  const { back, canGoBack, reset, replace } = useNav();
  const { showToast } = useAppState();
  const { trips } = useTrips();
  const { createGathering } = useWorld();
  const [form, setForm] = useState<Form>(readDraft);
  const [submitted, setSubmitted] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 화면을 나갔다 와도 입력값이 남도록 임시 저장
  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
      /* 용량 초과 등: 사진 없이 저장 */
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form, photos: [] }));
      } catch {
        /* noop */
      }
    }
  }, [form]);

  const trip = trips[0];
  const dateOptions = trip && tripDates(trip).length ? tripDates(trip) : Array.from({ length: 7 }, (_, i) => addDays(todayISO(), i));
  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  const max = Number(form.maxPeople);
  const errors = {
    title: !form.title.trim() ? '제목을 입력해 주세요.' : form.title.trim().length < 2 ? '제목은 2자 이상 적어 주세요.' : '',
    description: form.description.trim().length < 10 ? '다른 분들이 믿고 찾아올 수 있도록 10자 이상 적어 주세요.' : '',
    kind: !form.kind || !form.distance ? '모임 성격(식사·관광지)과 거리(근처·다른 지역)를 하나씩 골라 주세요.' : '',
    maxPeople: !form.maxPeople ? '최대 인원을 입력해 주세요.' : !Number.isInteger(max) || max < 2 || max > 6 ? '최대 인원은 나를 포함해 2~6명이에요.' : '',
    place: !form.place.trim() ? '모이는 장소를 입력해 주세요.' : '',
    time: !form.date
      ? '모이는 날짜를 골라 주세요.'
      : !validTime(form.start) || !validTime(form.end)
        ? '시작·종료 시간을 00:00 형식으로 입력해 주세요.'
        : form.end <= form.start
          ? '종료 시간은 시작 시간보다 늦어야 해요.'
          : '',
  };
  const hasError = Object.values(errors).some(Boolean);
  const show = (k: keyof typeof errors) => (submitted && errors[k] ? errors[k] : '');

  const onFiles = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    const room = MAX_PHOTOS - form.photos.length;
    if (files.length > room) showToast(`사진은 최대 ${MAX_PHOTOS}장까지 올릴 수 있어요.`, 'error');
    try {
      const urls = await Promise.all(files.slice(0, room).map(shrink));
      setForm((f) => ({ ...f, photos: [...f.photos, ...urls] }));
    } catch {
      showToast('사진을 불러오지 못했어요. 다른 사진으로 시도해 주세요.', 'error');
    }
  };

  const submit = () => {
    setSubmitted(true);
    if (hasError || !form.kind || !form.distance) {
      showToast('입력하지 않은 항목이 있어요. 표시된 부분을 확인해 주세요.', 'error');
      return;
    }
    const g = createGathering({
      kind: form.kind,
      distance: form.distance,
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      start: form.start,
      end: form.end,
      place: form.place.trim(),
      placeDetail: '직접 입력한 장소',
      meetNote: `${form.start} ${form.place.trim()}에서 만나요.`,
      maxPeople: max,
      photo: form.photos[0],
    });
    setForm(EMPTY);
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* noop */
    }
    showToast('모임을 만들었어요. 이 브라우저에서만 보이는 데모 모임이에요.', 'success');
    replace({ name: 'gathering', id: g.id });
  };

  const leave = () => (canGoBack ? back() : reset({ name: 'connections' }));
  const touched = JSON.stringify({ ...form }) !== JSON.stringify(EMPTY);

  return (
    <ScreenShell
      frame="Mobile 18 Create Gathering"
      tone="brand"
      title="모임 만들기"
      onBack={() => (touched ? setConfirmCancel(true) : leave())}
      trailing={<BellButton />}
      surface="mist"
      contentClassName="gather-form"
      bottomNav={<BottomNav active="connections" />}
    >
      <div className="photo-row">
        <button type="button" className="photo-add" onClick={() => fileRef.current?.click()} aria-label={`사진 추가 (${form.photos.length}/${MAX_PHOTOS})`}>
          <img src={camera} alt="" width={18} height={18} />
          <small>
            {form.photos.length}/{MAX_PHOTOS}
          </small>
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFiles} />
        {form.photos.map((p, i) => (
          <span key={i} className="photo-thumb">
            <img src={p} alt={`올린 사진 ${i + 1}`} />
            {i === 0 && <small>대표사진</small>}
            <button
              type="button"
              aria-label={`사진 ${i + 1} 삭제`}
              onClick={() => set({ photos: form.photos.filter((_, j) => j !== i) })}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <label className="form-block">
        <span className="form-title is-large">제목</span>
        <span className="form-title-hint" id="title-hint">아침에 천천히 걸어요. 모임장 포함 5명이에요.</span>
        <input
          className="soft-input"
          value={form.title}
          maxLength={30}
          placeholder="모임 제목을 입력해 주세요"
          aria-describedby="title-hint"
          aria-invalid={Boolean(show('title')) || undefined}
          onChange={(e) => set({ title: e.target.value })}
        />
        {show('title') && <span className="inline-error">{show('title')}</span>}
      </label>

      <label className="form-block">
        <span className="form-title">자세한 내용</span>
        <textarea
          className="soft-input"
          rows={3}
          value={form.description}
          maxLength={300}
          placeholder="모임 내용을 간단히 적어 주세요"
          aria-invalid={Boolean(show('description')) || undefined}
          onChange={(e) => set({ description: e.target.value })}
        />
        {show('description') && <span className="inline-error">{show('description')}</span>}
      </label>

      <div className="purpose-chips" role="group" aria-label="모임 성격과 거리">
        {(
          [
            ['kind', 'dining', '같이 식사하고 싶어요.'],
            ['kind', 'sightseeing', '같이 관광지 갈래요.'],
            ['distance', '근처', '근처에서 먹을 거에요.'],
            ['distance', '다른 지역', '다른 지역으로 갈 거에요.'],
          ] as const
        ).map(([field, value, label]) => {
          const on = form[field] === value;
          return (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              className={`purpose-chip ${on ? 'is-on' : ''}`}
              onClick={() => set({ [field]: on ? null : value } as Partial<Form>)}
            >
              {label}
            </button>
          );
        })}
      </div>
      {show('kind') && <p className="inline-error">{show('kind')}</p>}

      <label className="form-block">
        <span className="form-title">최대 인원 설정 ({form.maxPeople && !errors.maxPeople ? form.maxPeople : 0} / 6 명)</span>
        <input
          className="soft-input input-short"
          inputMode="numeric"
          value={form.maxPeople}
          placeholder="최대 인원을 입력해 주세요"
          aria-invalid={Boolean(show('maxPeople')) || undefined}
          onChange={(e) => set({ maxPeople: e.target.value.replace(/\D/g, '').slice(0, 1) })}
        />
        {show('maxPeople') && <span className="inline-error">{show('maxPeople')}</span>}
      </label>

      <label className="form-block">
        <span className="form-title">모이는 위치</span>
        <textarea
          className="soft-input"
          rows={2}
          value={form.place}
          maxLength={60}
          placeholder="모임 장소를 지도에서 선택해 주세요"
          aria-invalid={Boolean(show('place')) || undefined}
          onChange={(e) => set({ place: e.target.value })}
        />
        {show('place') && <span className="inline-error">{show('place')}</span>}
        <span className="form-help">지도에서 고르기는 지도 API 연결 후 제공돼요. 지금은 장소 이름을 직접 적어 주세요.</span>
      </label>

      <fieldset className="form-block">
        <legend className="form-title">모이는 시간</legend>
        <div className="time-fields soft-input">
          <select aria-label="모이는 날짜" value={form.date} onChange={(e) => set({ date: e.target.value })}>
            <option value="">날짜 선택</option>
            {dateOptions.map((d) => (
              <option key={d} value={d}>
                {formatMDW(d)}
              </option>
            ))}
          </select>
          <input aria-label="시작 시간" inputMode="numeric" placeholder="09:00" value={form.start} onChange={(e) => set({ start: formatTime(e.target.value) })} />
          <span aria-hidden="true">–</span>
          <input aria-label="종료 시간" inputMode="numeric" placeholder="10:00" value={form.end} onChange={(e) => set({ end: formatTime(e.target.value) })} />
        </div>
        {show('time') && <span className="inline-error">{show('time')}</span>}
      </fieldset>

      <button type="button" className="btn-primary" onClick={submit}>
        모임 만들기
      </button>
      <p className="footnote center">서버가 없어서 만든 모임은 이 브라우저에서만 보여요. 다른 여행자에게 공개되지 않아요.</p>

      {confirmCancel && (
        <ConfirmDialog
          title="모임 만들기를 멈출까요?"
          message="입력한 내용은 임시로 남아 있어서 다음에 이어서 쓸 수 있어요."
          confirmLabel="나가기"
          cancelLabel="계속 쓰기"
          onCancel={() => setConfirmCancel(false)}
          onConfirm={() => {
            setConfirmCancel(false);
            leave();
          }}
        />
      )}
    </ScreenShell>
  );
}
