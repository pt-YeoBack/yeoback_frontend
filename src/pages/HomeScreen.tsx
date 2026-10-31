import { ReactNode, useEffect, useRef, useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { BellButton, BottomNav, ConfirmDialog } from '../components/TripParts';
import { calendarDays, clover, house, plusWhite, sparkles, users } from '../components/icons';
import suitcaseImage from '../assets/home-suitcase.jpg';
import { useAppState } from '../lib/appState';
import { formatMDW, nightsDays } from '../lib/dates';
import { useNav } from '../lib/navigation';
import { getSessionUser } from '../lib/testAuthService';
import { peopleCount, Trip, useTrips } from '../lib/tripStore';

/** Figma 홈의 "동행 미리보기" 예시 — 아직 등록한 동행이 없을 때 보여 주는 샘플 */
const SAMPLE_COMPANIONS = [
  { id: 'sample-1', name: '민준', relation: '선택' },
  { id: 'sample-2', name: '민서', relation: '선택' },
  { id: 'sample-3', name: '지우', relation: '친구' },
  { id: 'sample-4', name: '하린', relation: '가족' },
];

/** Mobile 08 Home · 첫 여행을 기다리며 */
export function HomeScreen() {
  const { push } = useNav();
  const { showToast } = useAppState();
  const { trips, draft, startNewTrip, deleteTrip, discardDraft } = useTrips();
  const user = getSessionUser();
  const name = user?.name ?? '여행자';
  const [deleting, setDeleting] = useState<Trip | null>(null);

  const unsavedDraft = draft && !trips.some((t) => t.id === draft.id) ? draft : null;
  const latestCompanions =
    trips.find((t) => t.companions.length > 0)?.companions ?? (unsavedDraft?.companions.length ? unsavedDraft.companions : null);
  // 실제 동행을 먼저 보여 주고, 카드가 적으면 예시로 채워 가로로 넘겨 볼 수 있게 한다
  const companions = [
    ...(latestCompanions ?? []).map((c) => ({ ...c, sample: false })),
    ...SAMPLE_COMPANIONS.slice(0, Math.max(0, 4 - (latestCompanions?.length ?? 0))).map((c) => ({ ...c, sample: true })),
  ];

  const goNewTrip = (fresh = false) => {
    startNewTrip({ fresh });
    push({ name: 'newTrip' });
  };

  // Mobile 11 → 12 흐름과 같게: 저장한 여행은 날짜별 일정(Mobile 12)으로 연다
  const openTrip = (trip: Trip) => push({ name: 'dayPlan', tripId: trip.id });

  const openNearby = () => {
    const t = trips.find((x) => x.startDate);
    if (!t || !t.startDate) {
      showToast('여행을 먼저 저장하면 빈 시간에 맞는 근처 장소를 추천해 드려요.');
      return;
    }
    push({ name: 'nearby', tripId: t.id, day: t.startDate });
  };

  return (
    <ScreenShell
      frame="Mobile 08 Home"
      tone="brand"
      title={`${name}님의 여백`}
      noBackSlot
      trailing={<BellButton />}
      contentClassName="home-content"
      bottomNav={<BottomNav active="home" />}
    >
      <div className="home-greeting">
        <p className="home-greeting-sub">반가워요, {name}님</p>
        <p className="home-greeting-title">어디로 떠나볼까요?</p>
      </div>

      {trips.length === 0 ? (
        <section className="trip-invite" aria-labelledby="invite-title">
          <div className="trip-invite-symbol" aria-hidden="true">
            <img data-tint src={suitcaseImage} alt="" width={95} height={94} />
          </div>
          <h2 id="invite-title" className="trip-invite-title">
            새 여행 일정을 추가할까요?
          </h2>
          <p className="trip-invite-body">
            {unsavedDraft ? (
              <>
                작성 중인 여행이 있어요.
                <br />
                이어서 목적지와 날짜를 정해요.
              </>
            ) : (
              <>
                아직 등록한 여행이 없어요.
                <br />
                목적지와 날짜부터 가볍게 정해요.
              </>
            )}
          </p>
          <button type="button" className="btn-primary btn-icon" onClick={() => goNewTrip(false)}>
            <img src={plusWhite} alt="" width={22} height={22} />
            {unsavedDraft ? '작성 중인 여행 이어서 하기' : '첫 여행 일정 추가'}
          </button>
          {unsavedDraft && (
            <button
              type="button"
              className="link-button link-center-brand"
              onClick={() => {
                discardDraft();
                goNewTrip(true);
              }}
            >
              처음부터 새로 만들기
            </button>
          )}
        </section>
      ) : (
        <section className="trip-list" aria-labelledby="trip-list-title">
          <div className="section-row">
            <h2 id="trip-list-title" className="section-title">
              나의 여행
            </h2>
            <button type="button" className="chip chip-solid" onClick={() => goNewTrip(false)}>
              + 새 여행
            </button>
          </div>
          {unsavedDraft && (
            <button type="button" className="draft-banner" onClick={() => push({ name: 'newTrip' })}>
              작성 중인 여행이 있어요 · 이어서 작성하기
            </button>
          )}
          {trips.map((trip) => {
            const count = Object.values(trip.days).reduce((n, d) => n + d.activities.length, 0);
            return (
              <article key={trip.id} className="trip-card">
                <div className="trip-card-main">
                  <p className="trip-card-title">
                    {trip.destination ? `${trip.destination.city} · ${trip.destination.country}` : '여행지 미정'}
                  </p>
                  <p className="trip-card-meta">
                    {trip.startDate && trip.endDate
                      ? `${formatMDW(trip.startDate)} – ${formatMDW(trip.endDate)} · ${nightsDays(trip.startDate, trip.endDate)}`
                      : '날짜 미정'}
                  </p>
                  <p className="trip-card-meta">
                    {peopleCount(trip)}명 · 일정 {count}개
                  </p>
                </div>
                <div className="trip-card-actions">
                  <button type="button" className="btn-small" onClick={() => openTrip(trip)}>
                    일정 보기·수정
                  </button>
                  <button
                    type="button"
                    className="btn-small btn-small-ghost"
                    onClick={() => setDeleting(trip)}
                    aria-label={`${trip.destination?.city ?? '여행'} 삭제`}
                  >
                    삭제
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <section className="home-ai-guide">
        <div className="guidance-title">
          <img src={sparkles} alt="" width={19} height={19} />
          <h2>여행의 여백을 AI가 채워줘요</h2>
        </div>
        <p>
          직접 만든 일정에 가까운 장소를 제안해요.
          <br />
          쉬고 싶다면 여백을 그대로 두어도 좋아요.
        </p>
        <p className="ai-disclaimer">ai는 실수 할 수 있습니다.</p>
        <button type="button" className="link-button link-plain home-ai-link" onClick={openNearby}>
          근처 추천 받아 보기 ›
        </button>
      </section>

      <h2 className="home-section-heading">여백에서 할 수 있는 일</h2>

      <section className="companion-guide" aria-labelledby="companion-guide-title">
        <div className="guidance-title">
          <img src={users} alt="" width={19} height={19} />
          <h3 id="companion-guide-title">같이가는 사람 동행 정보</h3>
        </div>
        <p className="companion-guide-body">
          내 여행에는 동행의 실명과 초대 상태를 표시해요.
          <br />
          관계는 선택이며 연락처·숙소 정보는 비공개예요.
        </p>
        <CompanionCarousel count={companions.length}>
          {companions.map((c) => (
            <div className="companion-preview" role="listitem" key={c.id}>
              <p className="companion-preview-head">
                동행 미리보기
                {c.sample && <span className="sample-badge">예시</span>}
              </p>
              <div className="companion-preview-row">
                <div>
                  <span className="companion-label">이름</span>
                  <span className="companion-value">{c.name || '이름 미입력'}</span>
                </div>
                <div>
                  <span className="companion-label">관계</span>
                  <span className="companion-value">
                    {!c.relation || c.relation === '선택 안 함' ? '선택' : c.relation}
                  </span>
                </div>
              </div>
              <p className="companion-preview-note">인연에서는 별도의 닉네임만 공개돼요.</p>
            </div>
          ))}
        </CompanionCarousel>
      </section>

      <div className="getting-started">
        <button type="button" className="guide-tile" onClick={() => goNewTrip(false)}>
          <img src={calendarDays} alt="" width={24} height={24} />
          <span>내 속도로 계획</span>
        </button>
        <button
          type="button"
          className="guide-tile"
          onClick={() => push({ name: 'connections' })}
        >
          <img src={clover} alt="" width={24} height={24} />
          <span>짧고 좋은 인연</span>
        </button>
        <button
          type="button"
          className="guide-tile"
          onClick={openNearby}
        >
          <img src={house} alt="" width={24} height={24} />
          <span>가고픈 장소 추천</span>
        </button>
      </div>

      {deleting && (
        <ConfirmDialog
          title="여행을 삭제할까요?"
          message={`${deleting.destination?.city ?? '이'} 여행과 작성한 일정이 모두 삭제돼요.`}
          confirmLabel="삭제"
          danger
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteTrip(deleting.id);
            setDeleting(null);
            showToast('여행을 삭제했어요.');
          }}
        />
      )}
    </ScreenShell>
  );
}

/**
 * 동행 미리보기 가로 카드 — 손가락으로 밀거나(모바일), 마우스로 끌거나(데스크톱),
 * 아래 점·화살표로 한 장씩 넘길 수 있다.
 */
function CompanionCarousel({ count, children }: { count: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const [index, setIndex] = useState(0);
  // 카드가 한 화면에 1장 반 넘게 보이므로, 넘길 수 있는 위치는 카드 수 − 1 (n장 → 점 n−1개)
  const pages = Math.max(1, count - 1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const onScroll = () => {
      const card = el.querySelector<HTMLElement>('.companion-preview');
      const step = card ? card.offsetWidth + 11 : 211;
      const max = el.scrollWidth - el.clientWidth;
      setIndex(el.scrollLeft >= max - 2 ? pages - 1 : Math.min(pages - 1, Math.round(el.scrollLeft / step)));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [pages]);

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    // 마지막 점은 끝까지(마지막 카드가 다 보이게) 이동
    if (i >= pages - 1) {
      el.scrollTo({ left: el.scrollWidth - el.clientWidth, behavior: 'smooth' });
      return;
    }
    const card = el.querySelectorAll<HTMLElement>('.companion-preview')[i];
    if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  };

  return (
    <div className="companion-carousel">
      <div
        ref={ref}
        className="companion-scroller"
        role="list"
        aria-label="동행 미리보기 (가로로 넘겨 보기)"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') goTo(Math.min(pages - 1, index + 1));
          if (e.key === 'ArrowLeft') goTo(Math.max(0, index - 1));
        }}
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse' || !ref.current) return;
          drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false };
          ref.current.classList.add('is-dragging');
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || !ref.current) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 3) d.moved = true;
          ref.current.scrollLeft = d.left - dx;
        }}
        onPointerUp={() => {
          drag.current = null;
          ref.current?.classList.remove('is-dragging');
          goTo(index);
        }}
        onPointerLeave={() => {
          if (!drag.current) return;
          drag.current = null;
          ref.current?.classList.remove('is-dragging');
          goTo(index);
        }}
      >
        {children}
      </div>
      {count > 1 && (
        <div className="carousel-dots" role="group" aria-label="동행 카드 넘기기">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`carousel-dot ${i === index ? 'is-active' : ''}`}
              aria-label={`${i + 1} / ${pages} 위치로 넘기기`}
              aria-current={i === index || undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
