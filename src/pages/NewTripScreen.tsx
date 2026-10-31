import { useEffect, useMemo, useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { BellButton, BottomNav, BottomSheet, ConfirmDialog } from '../components/TripParts';
import { chevronLeft20, chevronRight20, mapPin22, search } from '../components/icons';
import { FormAlert } from '../components/FormControls';
import {
  formatMDW,
  fromISO,
  ISODate,
  monthGrid,
  nightsDays,
  todayISO,
  WEEKDAY_LABELS,
  weekday,
} from '../lib/dates';
import {
  customDestination,
  DEPARTURE_COUNTRIES,
  Destination,
  DESTINATIONS,
  Region,
  RELATIONS,
} from '../lib/destinations';
import { Route, useNav } from '../lib/navigation';
import { getSessionUser } from '../lib/testAuthService';
import { activitiesOutsideRange, Companion, emptyTrip, newId, useTrips } from '../lib/tripStore';

const MAX_PEOPLE = 10;
const MAX_NIGHTS = 30;

/** Mobile 09 New Plan · 목적지와 날짜 (1 / 2) */
export function NewTripScreen({ route }: { route: Extract<Route, { name: 'newTrip' }> }) {
  const { back, push, reset, canGoBack } = useNav();
  const { draft, updateDraft, startNewTrip } = useTrips();
  const [fallback] = useState(emptyTrip);
  const trip = draft ?? fallback;
  useEffect(() => {
    if (!draft) startNewTrip();
  }, [draft, startNewTrip]);
  const me = getSessionUser()?.name ?? '나';

  const initialMonth = useMemo(() => {
    const base = trip.startDate ? fromISO(trip.startDate) : new Date();
    if (!trip.startDate) base.setMonth(base.getMonth() + 1, 1); // 기본은 다음 달
    return { y: base.getFullYear(), m: base.getMonth() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [view, setView] = useState(initialMonth);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [companionsOpen, setCompanionsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<number | null>(null);

  const today = todayISO();
  const { startDate, endDate, destination, region } = trip;

  const errors = {
    destination: destination ? null : '여행할 지역을 선택해 주세요.',
    dates: !startDate ? '여행 날짜를 선택해 주세요.' : !endDate ? '여행 마지막 날짜를 선택해 주세요.' : null,
    companions: trip.companions.some((c) => !c.name.trim()) ? '동행자 이름을 모두 입력해 주세요.' : null,
  };
  const hasError = Boolean(errors.destination || errors.dates || errors.companions);

  const selectDay = (iso: ISODate) => {
    if (!startDate || (startDate && endDate)) {
      updateDraft({ startDate: iso, endDate: null });
    } else if (iso < startDate) {
      updateDraft({ startDate: iso, endDate: null });
    } else {
      const nights = Math.round((fromISO(iso).getTime() - fromISO(startDate).getTime()) / 86_400_000);
      if (nights > MAX_NIGHTS) return;
      updateDraft({ endDate: iso });
    }
  };

  const goNext = () => {
    setSubmitted(true);
    if (hasError || !startDate || !endDate) return;
    const dropped = activitiesOutsideRange(trip, startDate, endDate);
    if (dropped > 0 && pendingDrop === null) {
      setPendingDrop(dropped);
      return;
    }
    proceed();
  };

  const proceed = () => {
    setPendingDrop(null);
    if (route.returnTo === 'itinerary') back();
    else push({ name: 'itinerary' });
  };

  const peopleSummary = `${trip.companions.length + 1}명 · ${[me, ...trip.companions.map((c) => c.name || '이름 미입력')].join(', ')}`;

  const weeks = monthGrid(view.y, view.m);
  const isPastMonth = view.y * 12 + view.m <= fromISO(today).getFullYear() * 12 + fromISO(today).getMonth();

  return (
    <ScreenShell
      frame="Mobile 09 New Plan"
      tone="brand"
      title="새 여행 만들기"
      subtitle="1 / 2 · 목적지와 날짜"
      onBack={canGoBack ? back : () => reset({ name: 'home' })}
      trailing={<BellButton />}
      contentClassName="trip-content"
      bottomNav={<BottomNav active="schedule" />}
    >
      <div className="chip-row" role="radiogroup" aria-label="여행 지역 구분">
        {(['domestic', 'overseas'] as Region[]).map((r) => (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={region === r}
            className={`chip ${region === r ? 'chip-solid' : ''}`}
            onClick={() =>
              updateDraft((t) => ({
                ...t,
                region: r,
                destination: t.destination && t.destination.region === r ? t.destination : null,
              }))
            }
          >
            {r === 'domestic' ? '국내' : '해외'}
          </button>
        ))}
      </div>

      <DestinationVisual destination={destination} />

      <div className="destination-row">
        <img src={mapPin22} alt="" width={22} height={22} />
        <button type="button" className="destination-text" onClick={() => setPickerOpen(true)}>
          <span className="destination-name">
            {destination ? `${destination.city} · ${destination.country}` : '여행지를 선택해 주세요'}
          </span>
          <span className="destination-tagline">
            {destination ? destination.tagline : '검색해서 가고 싶은 곳을 골라요'}
          </span>
        </button>
        <button type="button" className="icon-button" aria-label="여행지 검색" onClick={() => setPickerOpen(true)}>
          <img src={search} alt="" width={22} height={22} />
        </button>
      </div>
      {submitted && errors.destination && <p className="inline-error">{errors.destination}</p>}

      <section className="calendar" aria-label="여행 날짜 선택">
        <div className="calendar-heading">
          <h2 aria-live="polite">
            {view.y}년 {view.m + 1}월
          </h2>
          <button
            type="button"
            className="icon-button"
            aria-label="이전 달"
            disabled={isPastMonth}
            onClick={() => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }))}
          >
            <img src={chevronLeft20} alt="" width={20} height={20} />
          </button>
          <button
            type="button"
            className="icon-button"
            aria-label="다음 달"
            onClick={() => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }))}
          >
            <img src={chevronRight20} alt="" width={20} height={20} />
          </button>
        </div>
        <div className="calendar-weekdays" aria-hidden="true">
          {WEEKDAY_LABELS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="calendar-grid" role="grid">
          {weeks.map((week, wi) => (
            <div className="calendar-week" role="row" key={wi}>
              {week.map((cell, ci) => {
                if (!cell.iso) return <span key={ci} className="calendar-day is-empty" role="gridcell" />;
                const iso = cell.iso;
                const isStart = iso === startDate;
                const isEnd = iso === endDate;
                const inRange = startDate && endDate && iso > startDate && iso < endDate;
                const past = iso < today;
                const d = fromISO(iso);
                return (
                  <span role="gridcell" key={ci} className="calendar-cell">
                    <button
                      type="button"
                      className={`calendar-day ${isStart || isEnd ? 'is-edge' : ''} ${inRange ? 'is-range' : ''} ${
                        startDate && endDate && startDate !== endDate && isStart ? 'is-start' : ''
                      } ${startDate && endDate && startDate !== endDate && isEnd ? 'is-end' : ''}`}
                      disabled={past}
                      aria-pressed={Boolean(isStart || isEnd || inRange)}
                      aria-label={`${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${weekday(iso)}요일${
                        isStart ? ', 출발일' : isEnd ? ', 마지막 날' : ''
                      }`}
                      onClick={() => selectDay(iso)}
                    >
                      {cell.day}
                    </button>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <div className="date-summary" aria-live="polite">
        {startDate && endDate
          ? `${formatMDW(startDate)} – ${formatMDW(endDate)} · ${nightsDays(startDate, endDate)}`
          : startDate
            ? `${formatMDW(startDate)} 출발 · 마지막 날짜를 선택해 주세요`
            : '출발 날짜와 마지막 날짜를 차례로 선택해 주세요'}
      </div>
      {submitted && errors.dates && <p className="inline-error">{errors.dates}</p>}

      <div className="trip-companions">
        <label className="trip-field">
          <span className="trip-field-label">출발 국가</span>
          <span className="select-wrap">
            <select
              value={trip.departureCountry}
              onChange={(e) => updateDraft({ departureCountry: e.target.value })}
              aria-label="출발 국가"
            >
              {DEPARTURE_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span aria-hidden="true">▾</span>
          </span>
        </label>
        <div className="trip-field">
          <span className="trip-field-label" id="people-label">
            함께 가는 사람
          </span>
          <button
            type="button"
            className="trip-field-value"
            aria-describedby="people-label"
            onClick={() => setCompanionsOpen(true)}
          >
            {peopleSummary}
          </button>
        </div>
      </div>
      {submitted && errors.companions && <p className="inline-error">{errors.companions}</p>}

      {submitted && hasError && (
        <FormAlert>입력하지 않은 항목이 있어요. 표시된 부분을 확인해 주세요.</FormAlert>
      )}

      <button type="button" className="btn-primary" onClick={goNext}>
        {route.returnTo === 'itinerary' ? '변경 내용 적용하기' : '일정 직접 추가하기'}
      </button>

      {pickerOpen && (
        <DestinationPicker
          region={region}
          selectedId={destination?.id}
          onClose={() => setPickerOpen(false)}
          onSelect={(d) => {
            updateDraft({ destination: d, region: d.region });
            setPickerOpen(false);
          }}
        />
      )}

      {companionsOpen && (
        <CompanionsSheet
          me={me}
          initial={trip.companions}
          onClose={() => setCompanionsOpen(false)}
          onSave={(list) => {
            updateDraft({ companions: list });
            setCompanionsOpen(false);
          }}
        />
      )}

      {pendingDrop !== null && (
        <ConfirmDialog
          title="여행 기간이 줄었어요"
          message={`새 기간 밖의 날짜에 작성한 일정 ${pendingDrop}개는 저장할 때 삭제돼요. 계속할까요?`}
          confirmLabel="계속하기"
          onCancel={() => setPendingDrop(null)}
          onConfirm={proceed}
        />
      )}
    </ScreenShell>
  );
}

function DestinationVisual({ destination }: { destination: Destination | null }) {
  if (destination?.photo) {
    return (
      <img
        className="destination-photo"
        src={destination.photo}
        alt={`${destination.city} 풍경`}
        width={354}
        height={104}
      />
    );
  }
  const [a, b] = destination?.tint ?? ['var(--sky-100)', 'var(--sky-200)'];
  return (
    <div
      className="destination-photo destination-placeholder"
      style={{ background: `linear-gradient(135deg, var(--dest-a, ${a}), var(--dest-b, ${b}))` }}
      aria-hidden="true"
    >
      <span>{destination ? destination.city : '어디로 떠나볼까요?'}</span>
    </div>
  );
}

function DestinationPicker({
  region,
  selectedId,
  onClose,
  onSelect,
}: {
  region: Region;
  selectedId?: string;
  onClose: () => void;
  onSelect: (d: Destination) => void;
}) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Region>(region);
  const q = query.trim();
  const list = DESTINATIONS.filter(
    (d) => (q ? true : d.region === tab) && (!q || `${d.city}${d.country}`.includes(q)),
  );

  return (
    <BottomSheet title="여행지 검색" onClose={onClose}>
      <div className="field">
        <label className="field-label" htmlFor="destination-search">
          도시 또는 나라 이름
        </label>
        <div className="field-input">
          <input
            id="destination-search"
            type="search"
            placeholder="예) 도쿄, 제주"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      {!q && (
        <div className="chip-row" role="radiogroup" aria-label="지역 구분">
          {(['domestic', 'overseas'] as Region[]).map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={tab === r}
              className={`chip ${tab === r ? 'chip-solid' : ''}`}
              onClick={() => setTab(r)}
            >
              {r === 'domestic' ? '국내' : '해외'}
            </button>
          ))}
        </div>
      )}
      <ul className="destination-list">
        {list.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              className={`destination-option ${selectedId === d.id ? 'is-selected' : ''}`}
              aria-pressed={selectedId === d.id}
              onClick={() => onSelect(d)}
            >
              <strong>
                {d.city} · {d.country}
              </strong>
              <span>{d.tagline}</span>
            </button>
          </li>
        ))}
        {q && (
          <li>
            <button
              type="button"
              className="destination-option destination-custom"
              onClick={() => onSelect(customDestination(q, tab))}
            >
              <strong>‘{q}’(으)로 직접 정하기</strong>
              <span>목록에 없는 곳도 여행지로 쓸 수 있어요</span>
            </button>
          </li>
        )}
      </ul>
      <p className="sheet-note">데모용 여행지 목록이에요. 실제 장소 검색은 연결되어 있지 않아요.</p>
    </BottomSheet>
  );
}

function CompanionsSheet({
  me,
  initial,
  onClose,
  onSave,
}: {
  me: string;
  initial: Companion[];
  onClose: () => void;
  onSave: (list: Companion[]) => void;
}) {
  const [list, setList] = useState<Companion[]>(initial.length ? initial : []);
  const [submitted, setSubmitted] = useState(false);
  const total = list.length + 1;

  const setCount = (n: number) => {
    const target = Math.max(1, Math.min(MAX_PEOPLE, n)) - 1;
    setList((l) =>
      target > l.length
        ? [...l, ...Array.from({ length: target - l.length }, () => ({ id: newId('cmp'), name: '', relation: '선택 안 함' }))]
        : l.slice(0, target),
    );
  };

  const save = () => {
    setSubmitted(true);
    if (list.some((c) => !c.name.trim())) return;
    onSave(list.map((c) => ({ ...c, name: c.name.trim() })));
  };

  return (
    <BottomSheet
      title="함께 가는 사람"
      onClose={onClose}
      footer={
        <button type="button" className="btn-primary" onClick={save}>
          완료
        </button>
      }
    >
      <div className="stepper" role="group" aria-label="동행 인원수">
        <span className="stepper-label">
          인원 <small>(나 포함)</small>
        </span>
        <button type="button" onClick={() => setCount(total - 1)} disabled={total <= 1} aria-label="인원 줄이기">
          −
        </button>
        <output aria-live="polite">{total}명</output>
        <button
          type="button"
          onClick={() => setCount(total + 1)}
          disabled={total >= MAX_PEOPLE}
          aria-label="인원 늘리기"
        >
          +
        </button>
      </div>

      <ul className="companion-list">
        <li className="companion-row is-me">
          <span className="companion-index">1</span>
          <span className="companion-me">{me} (나)</span>
        </li>
        {list.map((c, i) => {
          const invalid = submitted && !c.name.trim();
          return (
            <li className="companion-row" key={c.id}>
              <span className="companion-index">{i + 2}</span>
              <div className={`field ${invalid ? 'field-error' : ''}`}>
                <label className="sr-only" htmlFor={`cmp-name-${c.id}`}>
                  동행자 {i + 1} 이름
                </label>
                <div className="field-input">
                  <input
                    id={`cmp-name-${c.id}`}
                    placeholder="이름"
                    value={c.name}
                    maxLength={20}
                    aria-invalid={invalid || undefined}
                    onChange={(e) =>
                      setList((l) => l.map((x) => (x.id === c.id ? { ...x, name: e.target.value } : x)))
                    }
                  />
                </div>
              </div>
              <label className="sr-only" htmlFor={`cmp-rel-${c.id}`}>
                동행자 {i + 1} 관계
              </label>
              <span className="select-wrap select-boxed">
                <select
                  id={`cmp-rel-${c.id}`}
                  value={c.relation}
                  onChange={(e) =>
                    setList((l) => l.map((x) => (x.id === c.id ? { ...x, relation: e.target.value } : x)))
                  }
                >
                  {RELATIONS.map((r) => (
                    <option key={r} value={r}>
                      {r === '선택 안 함' ? '관계(선택)' : r}
                    </option>
                  ))}
                </select>
                <span aria-hidden="true">▾</span>
              </span>
            </li>
          );
        })}
      </ul>
      {submitted && list.some((c) => !c.name.trim()) && (
        <p className="inline-error" role="alert">
          동행자 이름을 모두 입력해 주세요.
        </p>
      )}
      <p className="sheet-note">관계는 선택이며 연락처·숙소 정보는 비공개예요.</p>
    </BottomSheet>
  );
}
