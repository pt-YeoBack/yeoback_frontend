import { DayTabStrip } from '../components/DayTabStrip';
import { SafeForm } from '../components/SafeForm';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { BellButton, BottomNav, ConfirmDialog } from '../components/TripParts';
import { pencil, plusCircle } from '../components/icons';
import { useAppState } from '../lib/appState';
import { formatMDW, formatShort, ISODate } from '../lib/dates';
import { Route, useNav } from '../lib/navigation';
import { Activity, DayPlan, newId, peopleCount, sortActivities, tripDates, useTrips } from '../lib/tripStore';

const EMPTY_DAY: DayPlan = { title: '', activities: [] };

/** 24시간 HH:MM (브라우저 언어에 따라 오전/오후로 바뀌는 type="time" 대신 사용) */
function isValidTime(t: string): boolean {
  const m = /^(\d{2}):(\d{2})$/.exec(t);
  return Boolean(m && Number(m[1]) < 24 && Number(m[2]) < 60);
}

/** 숫자만 입력해도 HH:MM 형태로 맞춰 줌 (예: 0930 → 09:30) */
function formatTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
}

function nextTime(list: Activity[]): string {
  if (list.length === 0) return '09:00';
  const last = sortActivities(list)[list.length - 1].time;
  const [h, m] = last.split(':').map(Number);
  const total = Math.min(h * 60 + m + 90, 23 * 60 + 30);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Mobile 10 Add Itinerary · 내 손으로 계획 (2 / 2) */
export function ItineraryScreen({ route }: { route: Extract<Route, { name: 'itinerary' }> }) {
  const { back, push, reset, resetTo, backTo, replace, canGoBack } = useNav();
  const { showToast } = useAppState();
  const { draft, updateDraft, saveDraft, trips } = useTrips();
  const dates = useMemo(() => (draft ? tripDates(draft) : []), [draft]);
  const [selected, setSelected] = useState<ISODate | null>(route.day ?? null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [deleting, setDeleting] = useState<Activity | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // 여행 정보가 없으면 Mobile 09로 돌려보낸다 (새로고침·직접 접근 대비)
  useEffect(() => {
    if (!draft || dates.length === 0) replace({ name: 'newTrip' });
  }, [draft, dates.length, replace]);

  const day = selected && dates.includes(selected) ? selected : dates[0];

  useEffect(() => {
    // 선택한 Day 탭이 보이도록 스크롤
    tabsRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [day]);

  if (!draft || !day) return null;

  const plan = draft.days[day] ?? EMPTY_DAY;
  const activities = sortActivities(plan.activities);
  const savedVersion = trips.find((t) => t.id === draft.id);
  const isDirty = !savedVersion || (draft.updatedAt ?? 0) > (savedVersion.savedAt ?? 0);
  const people = peopleCount(draft);

  const setPlan = (next: DayPlan) =>
    updateDraft((t) => ({ ...t, days: { ...t.days, [day]: next } }));

  const upsertActivity = (a: Activity) => {
    const exists = plan.activities.some((x) => x.id === a.id);
    setPlan({
      ...plan,
      activities: exists ? plan.activities.map((x) => (x.id === a.id ? a : x)) : [...plan.activities, a],
    });
  };

  const removeActivity = (id: string) => setPlan({ ...plan, activities: plan.activities.filter((x) => x.id !== id) });

  const save = () => {
    const saved = saveDraft();
    if (!saved) return;
    showToast('일정을 저장했어요. 나의 일정에서 언제든 다시 열어 볼 수 있어요.', 'success');
    // Figma 연결선: Mobile 10 → Mobile 12 (날짜별 일정). 12에서 뒤로 가면 Mobile 11 나의 일정.
    // 12에서 "일정 편집"으로 들어왔다면 그 12 화면으로 돌아간다.
    if (backTo((r) => r.name === 'dayPlan' && r.tripId === saved.id)) return;
    resetTo([{ name: 'schedules' }, { name: 'dayPlan', tripId: saved.id, day }]);
  };

  const subtitle = `2 / 2 · ${draft.destination ? `${draft.destination.city}, ${draft.destination.country}` : '여행지 미정'} · ${people}명`;

  return (
    <ScreenShell
      frame="Mobile 10 Add Itinerary"
      tone="brand"
      title="일정 추가"
      subtitle={subtitle}
      onBack={canGoBack ? back : () => reset({ name: 'home' })}
      trailing={<BellButton />}
      contentClassName="trip-content"
      bottomNav={<BottomNav active="schedule" />}
    >
      <DayTabStrip label="여행 일자" listRef={tabsRef}>
        {dates.map((d, i) => {
          const count = draft.days[d]?.activities.length ?? 0;
          return (
            <button
              key={d}
              type="button"
              role="tab"
              id={`day-tab-${d}`}
              aria-selected={d === day}
              aria-controls="day-panel"
              aria-label={`Day ${i + 1}, ${formatMDW(d)}, 일정 ${count}개`}
              className={`day-tab ${d === day ? 'is-active' : ''}`}
              onClick={() => {
                setSelected(d);
                setEditingId(null);
                setEditingTitle(false);
              }}
            >
              <strong>Day {i + 1}</strong>
              <span>{formatShort(d)}</span>
              {count > 0 && <i className="day-tab-dot" aria-hidden="true" />}
            </button>
          );
        })}
      </DayTabStrip>

      <section id="day-panel" role="tabpanel" aria-labelledby={`day-tab-${day}`} className="day-panel">
        <div className="day-heading">
          {editingTitle ? (
            <DayTitleEditor
              date={day}
              value={plan.title}
              onCancel={() => setEditingTitle(false)}
              onSave={(title) => {
                setPlan({ ...plan, title });
                setEditingTitle(false);
              }}
            />
          ) : (
            <>
              <button
                type="button"
                className="day-title"
                onClick={() => setEditingTitle(true)}
                aria-label={`${formatMDW(day)} 날짜 제목 ${plan.title ? `‘${plan.title}’ 수정` : '추가'}`}
              >
                {formatMDW(day)}
                {plan.title ? ` · ${plan.title}` : <span className="day-title-placeholder"> · 제목 추가</span>}
              </button>
              <span className="chip">직접 작성</span>
            </>
          )}
        </div>

        {activities.length === 0 ? (
          <p className="empty-day">아직 이 날의 일정이 없어요. 아래에서 시간과 장소를 넣어 추가해 보세요.</p>
        ) : (
          <ol className="time-rail">
            {activities.map((a, i) => (
              <li key={a.id} className="rail-event">
                <div className="rail-marker" aria-hidden="true">
                  <span className="rail-time">{a.time}</span>
                  <span className="rail-stop">{i + 1}</span>
                  <span className="rail-line" />
                </div>
                {editingId === a.id ? (
                  <ActivityForm
                    mode="edit"
                    initial={a}
                    onCancel={() => setEditingId(null)}
                    onDelete={() => setDeleting(a)}
                    onSubmit={(next) => {
                      upsertActivity(next);
                      setEditingId(null);
                      showToast('일정을 수정했어요.');
                    }}
                  />
                ) : (
                  <div className="activity-card">
                    <button
                      type="button"
                      className="activity-body"
                      onClick={() => setEditingId(a.id)}
                      aria-label={`${a.time} ${a.place} 수정`}
                    >
                      <span className="sr-only">{a.time} · </span>
                      <strong>{a.place}</strong>
                      {a.memo && <span>{a.memo}</span>}
                    </button>
                    <button
                      type="button"
                      className="icon-button activity-edit"
                      onClick={() => setEditingId(a.id)}
                      aria-label={`${a.place} 수정`}
                    >
                      <img src={pencil} alt="" width={16} height={16} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}

        <ActivityForm
          key={`new-${day}-${activities.length}`}
          mode="new"
          initial={{ id: '', time: nextTime(plan.activities), place: '', memo: '' }}
          onSubmit={(a) => {
            upsertActivity({ ...a, id: newId('act') });
            showToast(`${formatShort(day)} 일정에 추가했어요.`);
          }}
        />
      </section>

      <p className="itinerary-hint">시간과 장소를 눌러 수정할 수 있어요. 나머지 날짜는 나중에 채워도 괜찮아요.</p>

      <div className="itinerary-actions">
        <button type="button" className="link-button link-plain" onClick={() => push({ name: 'newTrip', returnTo: 'itinerary' })}>
          여행 정보(지역·날짜·동행) 수정
        </button>
        <span className={`save-state ${isDirty ? 'is-dirty' : ''}`} aria-live="polite">
          {isDirty ? '저장 전 · 임시 보관 중' : '저장됨'}
        </span>
      </div>

      <button type="button" className="btn-primary" onClick={save}>
        일정 저장하고 다음으로
      </button>

      {deleting && (
        <ConfirmDialog
          title="일정을 삭제할까요?"
          message={`${deleting.time} ${deleting.place} 일정이 삭제돼요.`}
          confirmLabel="삭제"
          danger
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            removeActivity(deleting.id);
            setDeleting(null);
            setEditingId(null);
            showToast('일정을 삭제했어요.');
          }}
        />
      )}
    </ScreenShell>
  );
}

function DayTitleEditor({
  date,
  value,
  onSave,
  onCancel,
}: {
  date: ISODate;
  value: string;
  onSave: (v: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState(value);
  return (
    <SafeForm
      className="day-title-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(text.trim());
      }}
    >
      <label className="sr-only" htmlFor="day-title-input">
        {formatMDW(date)} 날짜 제목
      </label>
      <span className="day-title-date">{formatMDW(date)} ·</span>
      <input
        id="day-title-input"
        autoFocus
        maxLength={24}
        placeholder="예) 도착 후 시부야"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onCancel()}
      />
      <button type="submit" className="btn-small">
        저장
      </button>
    </SafeForm>
  );
}

function ActivityForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  onDelete,
}: {
  mode: 'new' | 'edit';
  initial: Activity;
  onSubmit: (a: Activity) => void;
  onCancel?: () => void;
  onDelete?: () => void;
}) {
  const [time, setTime] = useState(initial.time);
  const [place, setPlace] = useState(initial.place);
  const [memo, setMemo] = useState(initial.memo);
  const [submitted, setSubmitted] = useState(false);
  const idBase = mode === 'new' ? 'new-activity' : `edit-${initial.id}`;
  const placeError = submitted && !place.trim() ? '장소 또는 활동을 입력해 주세요.' : null;
  const timeValid = isValidTime(time);
  const timeError = submitted && !timeValid ? '시간을 00:00~23:59 형식으로 입력해 주세요.' : null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!place.trim() || !timeValid) return;
    onSubmit({ ...initial, time, place: place.trim(), memo: memo.trim() });
    if (mode === 'new') {
      setPlace('');
      setMemo('');
      setSubmitted(false);
    }
  };

  return (
    <SafeForm className={`activity-editor ${mode === 'edit' ? 'is-edit' : ''}`} onSubmit={submit} noValidate>
      {mode === 'new' && (
        <div className="activity-editor-title">
          <img src={plusCircle} alt="" width={19} height={19} />
          <h3>활동 추가</h3>
        </div>
      )}
      <div className="activity-inputs">
        <div className="activity-time">
          <label htmlFor={`${idBase}-time`}>시간</label>
          <input
            id={`${idBase}-time`}
            type="text"
            inputMode="numeric"
            placeholder="09:00"
            maxLength={5}
            value={time}
            onChange={(e) => setTime(formatTimeInput(e.target.value))}
            aria-invalid={Boolean(timeError) || undefined}
            required
          />
        </div>
        <div className="activity-place">
          <label htmlFor={`${idBase}-place`}>장소 / 활동</label>
          <input
            id={`${idBase}-place`}
            placeholder="장소를 검색해 주세요"
            value={place}
            maxLength={40}
            onChange={(e) => setPlace(e.target.value)}
            aria-invalid={Boolean(placeError) || undefined}
            aria-describedby={placeError ? `${idBase}-err` : undefined}
            required
          />
        </div>
      </div>
      <div className="activity-memo">
        <label htmlFor={`${idBase}-memo`}>설명 (선택)</label>
        <input
          id={`${idBase}-memo`}
          placeholder="예) 입국·수하물 30–60분"
          value={memo}
          maxLength={60}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>
      {(placeError || timeError) && (
        <p id={`${idBase}-err`} className="inline-error" role="alert">
          {placeError ?? timeError}
        </p>
      )}
      <div className="activity-editor-actions">
        {mode === 'edit' && (
          <>
            <button type="button" className="btn-small btn-small-danger" onClick={onDelete}>
              삭제
            </button>
            <button type="button" className="btn-small btn-small-ghost" onClick={onCancel}>
              취소
            </button>
          </>
        )}
        <button type="submit" className="btn-small">
          {mode === 'new' ? '추가' : '저장'}
        </button>
      </div>
    </SafeForm>
  );
}
