import { useMemo } from 'react';
import { useAppState } from './appState';
import { useNav } from './navigation';
import { resetTestData } from './testAuthService';

/**
 * 상단 "더보기(…)" 메뉴. Figma에는 아이콘만 있고 메뉴 내용이 정의되어 있지 않아
 * 테스트에 필요한 최소 항목만 넣었습니다.
 */
export function useAppMenu() {
  const { reset } = useNav();
  const { clearSignupDraft, showToast } = useAppState();
  return useMemo(
    () => [
      { label: '처음 화면으로', onSelect: () => reset({ name: 'onboarding' }) },
      {
        label: '테스트 데이터 초기화',
        onSelect: () => {
          resetTestData();
          clearSignupDraft();
          showToast('테스트 계정과 인증 기록을 초기화했어요.', 'success');
          reset({ name: 'onboarding' });
        },
      },
    ],
    [reset, clearSignupDraft, showToast],
  );
}
