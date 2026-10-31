import { ChangeEvent, useRef, useState } from 'react';
import { ScreenShell } from '../components/ScreenShell';
import { BellButton, BottomNav, BottomSheet, ConfirmDialog } from '../components/TripParts';
import { Avatar } from '../components/WorldParts';
import { camera } from '../components/icons';
import { useAppState } from '../lib/appState';
import { useNav } from '../lib/navigation';
import { useWorld } from '../lib/worldStore';

/** 프로필 사진을 정사각형 200px로 줄여 data URL로 */
function toAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode'));
      img.onload = () => {
        const size = 200;
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const side = Math.min(img.width, img.height);
        c.getContext('2d')?.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        resolve(c.toDataURL('image/jpeg', 0.8));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/** Mobile 21 (두 번째 프레임) · 프로필 수정 */
export function ProfileEditScreen() {
  const { back, canGoBack, reset } = useNav();
  const { showToast } = useAppState();
  const { profile, updateProfile } = useWorld();
  const [nickname, setNickname] = useState(profile.nickname);
  const [intro, setIntro] = useState(profile.intro);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [picker, setPicker] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const nickError = !nickname.trim()
    ? '닉네임을 입력해 주세요.'
    : nickname.trim().length < 2 || nickname.trim().length > 12
      ? '닉네임은 2~12자로 적어 주세요.'
      : '';
  const dirty = nickname !== profile.nickname || intro !== profile.intro || avatar !== profile.avatar;
  const leave = () => (canGoBack ? back() : reset({ name: 'profile' }));

  const save = () => {
    setSubmitted(true);
    if (nickError) return;
    updateProfile({ nickname: nickname.trim(), intro: intro.trim(), avatar });
    showToast('프로필을 저장했어요.', 'success');
    leave();
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      setAvatar(await toAvatar(f));
      setPicker(false);
    } catch {
      showToast('사진을 불러오지 못했어요.', 'error');
    }
  };

  return (
    <ScreenShell
      frame="Mobile 21 Profile Edit"
      tone="brand"
      title="프로필 수정"
      onBack={() => (dirty ? setConfirm(true) : leave())}
      trailing={<BellButton />}
      contentClassName="profile-edit"
      bottomNav={<BottomNav active="profile" />}
    >
      <button type="button" className="avatar-edit" onClick={() => setPicker(true)} aria-label="프로필 사진 바꾸기">
        <Avatar nickname={nickname || profile.nickname} avatar={avatar} size={100} />
        <span className="avatar-badge" aria-hidden="true">
          <img src={camera} alt="" width={14} height={14} />
        </span>
      </button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />

      <label className="form-block">
        <span className="form-title small">Name · 인연 닉네임</span>
        <input
          className="box-input"
          value={nickname}
          maxLength={12}
          aria-invalid={(submitted && Boolean(nickError)) || undefined}
          onChange={(e) => setNickname(e.target.value)}
        />
        {submitted && nickError ? <span className="inline-error">{nickError}</span> : <span className="form-help">인연에서는 실명 대신 이 닉네임만 보여요.</span>}
      </label>

      <label className="form-block">
        <span className="form-title small">간단한 소개</span>
        <textarea className="box-input" rows={3} maxLength={80} value={intro} onChange={(e) => setIntro(e.target.value)} />
        <span className="form-help">{intro.length}/80</span>
      </label>

      <button type="button" className="btn-primary" onClick={save}>
        저장하기
      </button>

      {picker && (
        <BottomSheet title="프로필 사진" placement="center" onClose={() => setPicker(false)}>
          <div className="sheet-actions sheet-actions-stack photo-choices">
            <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}>
              사진 올리기 (이 기기에만 저장)
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setAvatar('puppy');
                setPicker(false);
              }}
            >
              Figma 예시 캐릭터 쓰기
            </button>
            <button
              type="button"
              className="btn-text"
              onClick={() => {
                setAvatar('initial');
                setPicker(false);
              }}
            >
              닉네임 첫 글자로 표시
            </button>
          </div>
        </BottomSheet>
      )}

      {confirm && (
        <ConfirmDialog
          title="수정한 내용을 저장하지 않고 나갈까요?"
          message="저장하지 않은 변경 사항은 사라져요."
          confirmLabel="나가기"
          cancelLabel="계속 수정"
          onCancel={() => setConfirm(false)}
          onConfirm={() => {
            setConfirm(false);
            leave();
          }}
        />
      )}
    </ScreenShell>
  );
}
