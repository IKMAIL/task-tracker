import React, { createContext, useCallback, useContext, useState } from 'react';

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  resolve: (value: boolean) => void;
}

interface ConfirmCtx {
  confirm: (message: string, title?: string) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmCtx>({
  confirm: () => Promise.resolve(false),
});

const INITIAL: ConfirmState = { open: false, title: '', message: '', resolve: () => {} };

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState>(INITIAL);

  const confirm = useCallback((message: string, title = 'Confirm') => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, title, message, resolve });
    });
  }, []);

  const handle = (value: boolean) => {
    state.resolve(value);
    setState(INITIAL);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.open && (
        <div className="confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="confirm-dialog">
            <h2 id="confirm-title">{state.title}</h2>
            <p>{state.message}</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => handle(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handle(true)} autoFocus>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
