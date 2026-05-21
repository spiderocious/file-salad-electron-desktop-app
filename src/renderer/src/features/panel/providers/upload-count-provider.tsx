import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface UploadCountContextValue {
  // Files uploaded during this app session (in memory only — resets on quit).
  readonly count: number;
  readonly increment: () => void;
}

const UploadCountContext = createContext<UploadCountContextValue | null>(null);

export function UploadCountProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const increment = useCallback(() => setCount((c) => c + 1), []);
  return (
    <UploadCountContext.Provider value={{ count, increment }}>
      {children}
    </UploadCountContext.Provider>
  );
}

export function useUploadCount(): UploadCountContextValue {
  const ctx = useContext(UploadCountContext);
  if (!ctx) throw new Error('useUploadCount must be used within UploadCountProvider');
  return ctx;
}
