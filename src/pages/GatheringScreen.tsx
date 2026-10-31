import { useEffect, useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { BellButton, BottomNav, ConfirmDialog } from '../components/TripParts';
import { Avatar } from '../components/WorldParts';
import {
  cameraWhite,
  camera,
  chevronRight18,
  clock,
  cloud,
  cloudWhite,
  clover,
  footprints,
  footprintsWhite,
  heart,
  heartWhite,
  mapPin22,
  messageWhite,
  shieldCheck,
  sun,
  sunWhite,
} from '../components/icons';
import sushiPhoto from '../assets/gathering-sushi.jpg';
import asakusaPhoto from '../assets/gathering-asakusa.jpg';
import cafePhoto from '../assets/notebook-cafe.jpg';
import tokyoPhoto from '../assets/destination-tokyo.jpg';
import { useAppState } from '../lib/appState';
import { formatMDW, formatShort } from '../lib/dates';
import { Route, useNav } from '../lib/navigation';
import { Gathering, Member, useWorld } from '../lib/worldStore';
import { KIND_LABEL } from './ConnectionsScreen';

export function gatheringPhoto(g: Gathering): string | undefined {
  if (g.photo === 'sushi') return sushiPhoto;
  if (g.photo === 'asakusa') return asakusaPhoto;
  if (g.photo === 'cafe') return cafePhoto;
  if (g.photo === 'tokyo') return tokyoPhoto;
  return g.photo || undefined;
}

const MEMBER_ICONS = {
  sun: [sun, sunWhite],
  camera: [camera, cameraWhite],
  cloud: [cloud, cloudWhite],
  footprints: [footprints, footprintsWhite],
  heart: [heart, heartWhite],
} as const;

/** Mobile 17 Dining Gathering · 함께하는 저녁 / Mobile 18 Sightseeing Gathering · 아사쿠사 산책 */
export function GatheringScreen({ route }: { route: Extract<Route, { name: 'gathering' }> }) {
  const { back, canGoBack, reset, push } = useNav();
  const { showToast } = useAppState();
  const world = useWorld();
  const g = world.getGathering(route.id);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!g) reset({ name: 'connections' });
  }, [g, reset]);

  if (!g) return null;

  const joined = world.isJoined(g.id);
  const count = world.memberCount(g);
  const full = !joined && count >= g.maxPeople;
  const me = world.profile.privacy.nickname ? world.profile.nickname : '여행자';
  const isDining = g.kind === 'dining';
  const photo = gatheringPhoto(g);
  const other = world.gatherings.find((x) => x.id !== g.id && x.kind !== g.kind);

  // 모임장 → 나 → 나머지 순서 (내가 만든 모임이면 내가 모임장)
  const host = g.mine ? null : g.members.find((m) => m.role === '모임장');
  const people: (Member & { me?: boolean })[] = [
    ...(host ? [host] : []),
    ...(joined || g.mine ? [{ nickname: me, role: g.mine ? '모임장 · 나' : '나', me: true, icon: 'footprints' as const }] : []),
    ...g.members.filter((m) => m !== host),
  ];

  const joinNow = () => {
    if (full) return;
    world.join(g.id);
    showToast(`${g.title} 모임에 참여했어요. 대화방에서 인사해 보세요.`, 'success');
  };

  return (
    <ScreenShell
      frame={isDining ? 'Mobile 17 Dining Gathering' : 'Mobile 18 Sightseeing Gathering'}
      tone="brand"
      title={isDining ? '식사 모임' : '관광지 모임'}
      onBack={canGoBack ? back : () => reset({ name: 'connections' })}
      trailing={<BellButton />}
      surface={isDining ? 'white' : 'mist'}
      contentClassName="gathering-content"
      bottomNav={<BottomNav active="connections" />}
    >
      {photo ? <img className="gathering-hero" src={photo} alt="" /> : <span className="gathering-hero gathering-hero-empty">{g.title}</span>}

      <div className="chip-row">
        <span className="chip">
          {KIND_LABEL[g.kind]} · {g.distance}
        </span>
        <span className={`chip ${joined || g.mine ? 'chip-solid' : ''}`}>
          {joined || g.mine ? '참여 완료' : '참여 전'} · {count} / {g.maxPeople}명
        </span>
        {g.sample && <span className="sample-badge">예시 모임</span>}
      </div>

      <div>
        <h2 className="gathering-heading">{g.title}</h2>
        <p className="gathering-desc">
          {g.description}
          <br />
          {host ? `${host.nickname} 모임장과 함께 ` : ''}
          {joined || g.mine ? `총 ${count}명이에요.` : `지금 ${count}명이 참여하고 있어요.`}
        </p>
      </div>

      {isDining ? (
        <section className="info-card">
          <p className="info-line info-strong">
            <img src={clock} alt="" width={18} height={18} />
            {formatMDW(g.date)} · {g.start}–{g.end}
          </p>
          <div className="info-line">
            <img src={mapPin22} alt="" width={18} height={18} />
            <div>
              <strong>{g.place}</strong>
              <span>
                {g.placeDetail}
                <br />
                {g.meetNote}
              </span>
            </div>
          </div>
          {g.extraNote && <p className="info-extra">{g.extraNote}</p>}
        </section>
      ) : (
        <section className="info-card">
          <p className="info-date">
            {formatMDW(g.date)} · {g.start}–{g.end}
          </p>
          <div className="info-inner">
            <div className="info-line">
              <img src={mapPin22} alt="" width={18} height={18} />
              <div>
                <strong>{g.place}</strong>
                <span>
                  {g.placeDetail}
                  <br />
                  {g.meetNote}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="map-link"
              onClick={() => showToast('지도 앱 연결은 아직 준비 중이에요. 장소 이름으로 직접 검색해 주세요.')}
            >
              › 지도에서 확인하기 (연결 필요)
            </button>
          </div>
        </section>
      )}

      <section aria-labelledby="people-title">
        <h2 id="people-title" className="people-title">
          함께하는 사람 · {count}
          {isDining ? ` / 최대 ${g.maxPeople}명` : '명'}
        </h2>
        {!isDining && <p className="people-sub">최대 인원 {g.maxPeople}명</p>}
        <ul className="people-row">
          {people.map((m, i) => {
            const iconPair = !isDining && m.icon ? MEMBER_ICONS[m.icon] : null;
            const solid = i === 0;
            return (
              <li key={`${m.nickname}-${i}`}>
                {(() => {
                  const inner = (
                    <>
                      <Avatar nickname={m.nickname} solid={solid} size={42} icon={iconPair ? iconPair[solid ? 1 : 0] : undefined} />
                      <span className={m.role ? 'is-strong' : ''}>
                        {m.nickname}
                        {m.role && (
                          <>
                            <br />
                            {m.role}
                          </>
                        )}
                      </span>
                    </>
                  );
                  // 나를 뺀 다른 참여자는 눌러서 회원 프로필(20-1)로
                  return m.me ? (
                    inner
                  ) : (
                    <button
                      type="button"
                      className="people-link"
                      onClick={() => push({ name: 'member', nickname: m.nickname, gatheringId: g.id })}
                      aria-label={`${m.nickname} 프로필 보기`}
                    >
                      {inner}
                    </button>
                  );
                })()}
              </li>
            );
          })}
        </ul>
      </section>

      <section className={isDining ? 'privacy-card' : 'care-card'}>
        <h3 className="guidance-title">
          {isDining && <img src={shieldCheck} alt="" width={19} height={19} />}
          {isDining ? '인연에는 닉네임만 공개돼요' : '서로의 여행을 배려해요'}
        </h3>
        <p>
          {isDining
            ? '인연에는 닉네임만 공개해요. 실명·연락처 공유는 직접 동의할 때만 가능해요. 각자 결제하며 만남은 선택이에요. 불편하면 신고·차단하거나 모임을 나갈 수 있어요.'
            : '사진 촬영과 개인정보 공유는 먼저 동의를 구해요. 인연에는 닉네임만 표시하고 실명·연락처는 기본 비공개예요. 참여는 선택이며 원하면 신고·차단하거나 모임을 나갈 수 있어요. 사찰 예절을 지키고 교통비는 각자 부담해요.'}
        </p>
      </section>

      {joined || g.mine ? (
        <button type="button" className="btn-primary btn-icon" onClick={() => push({ name: 'chat', id: g.id })}>
          <img src={messageWhite} alt="" width={22} height={22} />
          모임 대화 들어가기
        </button>
      ) : (
        <button type="button" className="btn-primary" onClick={joinNow} disabled={full}>
          {full ? '모집 인원이 다 찼어요' : '이 모임에 참여하기'}
        </button>
      )}
      {(joined || g.mine) && (
        <button type="button" className="link-button link-center-brand" onClick={() => setLeaving(true)}>
          {g.mine ? '모임 닫기' : '모임 나가기'}
        </button>
      )}

      {other && (
        <button type="button" className="link-card" onClick={() => push({ name: 'gathering', id: other.id })}>
          <img src={clover} alt="" width={22} height={22} />
          <span>
            <strong>
              {KIND_LABEL[other.kind]}도 함께 · {other.title}
            </strong>
            <small>
              {formatShort(other.date)} {other.start}–{other.end} · {other.distance === '다른 지역' ? '다른 지역' : '근처'} 모임 보기
            </small>
          </span>
          <img src={chevronRight18} alt="" width={18} height={18} />
        </button>
      )}

      {leaving && (
        <ConfirmDialog
          title={g.mine ? '모임을 닫을까요?' : '모임에서 나갈까요?'}
          message={g.mine ? '내가 만든 모임과 대화가 목록에서 사라져요.' : '대화방에서도 나가요. 나중에 다시 참여할 수 있어요.'}
          confirmLabel={g.mine ? '닫기' : '나가기'}
          danger
          onCancel={() => setLeaving(false)}
          onConfirm={() => {
            world.leave(g.id);
            setLeaving(false);
            showToast(g.mine ? '모임을 닫았어요.' : '모임에서 나왔어요.');
            if (g.mine) reset({ name: 'connections' });
          }}
        />
      )}
    </ScreenShell>
  );
}
