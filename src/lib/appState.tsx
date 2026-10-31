import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ContactMethod } from './validation';

/** 회원가입 입력값 — 인증 화면에서 "이메일 변경"으로 돌아와도 입력이 유지되도록 보관 */
export interface SignupDraft {
  name: string;
  method: ContactMethod;
  email: string;
  phone: string;
  password: string;
  confirm: string;
  agreeTerms: boolean;
  agreeAge: boolean;
  agreeMarketing: boolean;
}

export const emptySignupDraft: SignupDraft = {
  name: '',
  method: 'email',
  email: '',
  phone: '',
  password: '',
  confirm: '',
  agreeTerms: false,
  agreeAge: false,
  agreeMarketing: false,
};

interface Toast {
  id: number;
  message: string;
  tone: 'info' | 'success' | 'error';
}

interface AppState {
  signupDraft: SignupDraft;
  setSignupDraft: (patch: Partial<SignupDraft>) => void;
  clearSignupDraft: () => void;
  toast: Toast | null;
  showToast: (message: string, tone?: Toast['tone']) => void;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [signupDraft, setDraft] = useState<SignupDraft>(emptySignupDraft);
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const setSignupDraft = useCallback((patch: Partial<SignupDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);
  const clearSignupDraft = useCallback(() => setDraft(emptySignupDraft), []);

  const showToast = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    window.clearTimeout(timer.current);
    setToast({ id: Date.now(), message, tone });
    timer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const value = useMemo(
    () => ({ signupDraft, setSignupDraft, clearSignupDraft, toast, showToast }),
    [signupDraft, setSignupDraft, clearSignupDraft, toast, showToast],
  );
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider');
  return ctx;
}
