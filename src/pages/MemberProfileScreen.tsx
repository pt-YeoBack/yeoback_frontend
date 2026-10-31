import { ScreenShell } from '../components/ScreenShell';
import { BottomNav } from '../components/TripParts';
import { bookOpen } from '../components/icons';
import { useAppState } from '../lib/appState';
import { Route, useNav } from '../lib/navigation';
import { getMemberProfile, MemberPost } from '../lib/members';
import { Gathering, useWorld } from '../lib/worldStore';
import { gatheringPhoto } from './GatheringScreen';

type Post = MemberPost & { gatheringId?: string };

function dotDate(iso: string) {
  return iso.replace(/-/g, '.');
}

/**
 * Mobile 20-1 회원 프로필 (Figma 359:701)
 * 모임 대화(19)·저장된 대화(22)에서 다른 참여자의 닉네임을 누르면 열린다.
 * 친구 신청·신고는 서버가 없어 테스트 동작으로만 표시한다.
 */
export function MemberProfileScreen({ route }: { route: Extract<Route, { name: 'member' }> }) {
  const { back, canGoBack, reset, push } = useNav();
  const { showToast } = useAppState();
  const world = useWorld();
  const profile = getMemberProfile(route.nickname);
  const requested = world.friendRequests.includes(profile.nickname);

  // Figma 회원(느린 발걸음)은 그려진 모집글 그대로, 나머지는 이 기기의 모임 목록에서 직접 연 모임을 덧붙인다
  const hosted = (): Post[] =>
    profile.fromFigma
      ? []
      : world.gatherings
          .filter((g) => g.members.some((m) => m.nickname === profile.nickname && m.role === '모임장'))
          .map((g: Gathering) => {
            const count = world.memberCount(g);
            return {
              id: g.id,
              gatheringId: g.id,
              title: g.title,
              meta: `${dotDate(g.date)} · ${g.start}–${g.end} · ${count < g.maxPeople ? `${g.maxPeople - count}명 모집` : `${g.maxPeople}명`}`,
              status: (count < g.maxPeople ? 'open' : 'closed') as Post['status'],
              photo: gatheringPhoto(g),
              photoAlt: g.place,
            };
          });
  // 참여한 모집글은 개인 정보라 프로필에 보여 주지 않는다 (2026-10-31 피드백) — 직접 작성한 모집글만
  const written: Post[] = [...hosted(), ...profile.written];

  const report = () => showToast('신고 기능은 서버 연결 후 제공돼요. 지금은 접수되지 않아요.');

  return (
    <ScreenShell
      frame="Mobile 20-1 Member Profile"
      tone="brand"
      title="프로필"
      onBack={canGoBack ? back : () => reset({ name: 'connections' })}
      menu={[
        { label: '신고하기 (연결 필요)', onSelect: report },
        { label: '차단하기 (연결 필요)', onSelect: () => showToast('차단 기능은 서버 연결 후 제공돼요. 지금은 적용되지 않아요.') },
      ]}
      contentClassName="member-content"
      bottomNav={<BottomNav active="profile" />}
    >
      <header className="member-head">
        <span className="member-avatar" aria-hidden="true">
          {profile.nickname.trim().charAt(0)}
        </span>
        <div className="member-name">
          <h2>{profile.nickname}</h2>
          <p>{profile.intro}</p>
        </div>
        <button
          type="button"
          className={`member-friend ${requested ? 'is-requested' : ''}`}
          aria-pressed={requested}
          onClick={() => {
            const on = world.toggleFriendRequest(profile.nickname);
            showToast(
              on
                ? '테스트 동작: 신청 표시만 했어요. 서버 연결 전이라 상대에게 전달되지 않아요.'
                : '친구 신청 표시를 취소했어요.',
            );
          }}
        >
          {requested ? '신청함' : '친구 신청'}
        </button>
      </header>

      <section className="member-taste" aria-labelledby="member-taste-title">
        <h3 id="member-taste-title">여행 취향</h3>
        {profile.tastes.length > 0 && (
          <ul className="member-chips">
            {profile.tastes.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
        <p>{profile.tasteNote}</p>
      </section>

      <section className="member-posts" aria-labelledby="member-posts-title">
        <h2 id="member-posts-title" className="member-posts-title">
          <img src={bookOpen} alt="" width={24} height={24} />
          모집글
        </h2>
        <p className="member-posts-lead">직접 작성한 여행 모집글이에요.</p>

        <PostGroup title="작성한 모집글" mark="내가 작성" posts={written} onOpen={(id) => push({ name: 'gathering', id })} />
        {!profile.fromFigma && <p className="footnote">예시 회원 정보예요. 서버 연결 후 실제 회원 정보로 바뀌어요.</p>}
      </section>
    </ScreenShell>
  );
}

function PostGroup({ title, mark, posts, onOpen }: { title: string; mark: string; posts: Post[]; onOpen: (gatheringId: string) => void }) {
  return (
    <section className="member-post-group" aria-label={title}>
      <h3>{title}</h3>
      {posts.length === 0 ? (
        <p className="compare-empty">아직 {title}이 없어요.</p>
      ) : (
        <ul>
          {posts.map((p) => {
            const body = (
              <>
                {p.photo ? (
                  <img className="member-post-photo" src={p.photo} alt={p.photoAlt} />
                ) : (
                  <span className="member-post-photo is-empty">사진 · {p.photoAlt}</span>
                )}
                <span className="member-post-tags">
                  <span className={`member-status ${p.status === 'open' ? 'is-open' : ''}`}>{p.status === 'open' ? '모집 중' : '모집 완료'}</span>
                  <small>{mark}</small>
                </span>
                <strong className="member-post-title">{p.title}</strong>
                <span className="member-post-meta">{p.meta}</span>
              </>
            );
            return (
              <li key={p.id}>
                {p.gatheringId ? (
                  <button
                    type="button"
                    className={`member-post ${p.status === 'closed' ? 'is-closed' : ''}`}
                    onClick={() => onOpen(p.gatheringId as string)}
                  >
                    {body}
                  </button>
                ) : (
                  <article className={`member-post ${p.status === 'closed' ? 'is-closed' : ''}`}>{body}</article>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
