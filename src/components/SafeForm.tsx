import { FormEvent, ReactNode } from 'react';

/**
 * 어디서 열어도 동작하는 <form>
 *
 * claude.ai 아티팩트 보기 화면, 일부 앱 안 브라우저, 사내 미리보기처럼 iframe에
 * `allow-forms` 권한이 없는 곳에서는 브라우저가 폼 제출(submit)을 막아 버려서
 * "로그인" 같은 버튼을 눌러도 아무 일도 일어나지 않습니다.
 * 그래서 제출 버튼 클릭과 입력칸의 Enter 키를 직접 받아 onSubmit을 부르고,
 * 브라우저의 기본 제출은 쓰지 않습니다. (한글 입력 중 Enter는 글자 확정이라 무시)
 */
export function SafeForm({
  onSubmit,
  children,
  className,
  noValidate = true,
}: {
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  className?: string;
  noValidate?: boolean;
}) {
  const fire = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    onSubmit(e as unknown as FormEvent);
  };

  return (
    <form
      className={className}
      noValidate={noValidate}
      onSubmit={fire}
      onClickCapture={(e) => {
        const btn = (e.target as HTMLElement).closest('button');
        if (!btn || btn.type !== 'submit' || btn.disabled || btn.form !== e.currentTarget) return;
        fire(e);
      }}
      onKeyDown={(e) => {
        const t = e.target as HTMLElement;
        if (e.key !== 'Enter' || e.nativeEvent.isComposing || e.keyCode === 229) return;
        if (t.tagName !== 'INPUT') return;
        const type = (t as HTMLInputElement).type;
        if (['checkbox', 'radio', 'button', 'submit', 'file'].includes(type)) return;
        fire(e);
      }}
    >
      {children}
    </form>
  );
}
