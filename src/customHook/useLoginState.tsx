import { useState } from "react";

type LoginStep = 'username' | 'qr' | 'verification';

interface LoginState {
  step: LoginStep;
  username: string;
  isRecoveryMode: boolean;
}


export const useLoginState = () => {
  const [state, setState] = useState<LoginState>({
    step: 'username',
    username: '',
    isRecoveryMode: false,
  });

  const updateStep = (step: LoginStep) => {
    setState(prev => ({ ...prev, step }));
  };

  const setUsername = (username: string) => {
    setState(prev => ({ ...prev, username }));
  };

  const toggleRecoveryMode = () => {
    setState(prev => ({ ...prev, isRecoveryMode: !prev.isRecoveryMode }));
  };

  const goBack = () => {
    if (state.step === 'verification') {
      updateStep('qr');
    } else if (state.step === 'qr') {
      updateStep('username');
    }
  };

  return {
    ...state,
    updateStep,
    setUsername,
    toggleRecoveryMode,
    goBack,
  };
};