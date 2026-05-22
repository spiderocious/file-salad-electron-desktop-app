import { Show } from 'meemaw';
import { useState } from 'react';

import { AlertCircle, Loader2 } from '@icons';
import { OtpInput } from '@shared/ui/otp-input/otp-input.tsx';

import { useRedeemCode } from '../../api/use-share.ts';
import type { RedeemedFile } from '../../../../../../shared/types/upload.ts';
import { ResultPanel } from './result-panel.tsx';

const CODE_LENGTH = 7;

// The "Code" tab inside the panel drop card: enter a share code, redeem it for
// the file's link. Reuses ResultPanel (Copy + Open). Errors render inline.
export function CodeRedeem() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<RedeemedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const redeem = useRedeemCode();

  function handleComplete(value: string): void {
    setError(null);
    redeem.mutate(value, {
      onSuccess: (file) => setResult(file),
      onError: () => setError("That code didn't work. It may be wrong or expired."),
    });
  }

  function reset(): void {
    setResult(null);
    setError(null);
    setCode('');
  }

  return (
    <Show
      when={!result}
      fallback={
        result ? (
          <ResultPanel
            title="Here's your file"
            filename={result.filename}
            url={result.url}
            resetLabel="Redeem another code"
            onReset={reset}
          />
        ) : null
      }
    >
      <div className="flex w-full flex-col items-center gap-3 text-center">
        <p className="text-sm font-medium text-[var(--fs-text)]">Enter a share code</p>
        <OtpInput
          length={CODE_LENGTH}
          value={code}
          onChange={(v) => {
            setCode(v);
            setError(null);
          }}
          onComplete={handleComplete}
          disabled={redeem.isPending}
          autoFocus
          aria-label="Share code"
        />

        <Show when={redeem.isPending}>
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--fs-text-secondary)]">
            <Loader2 size={13} className="animate-spin" aria-hidden="true" /> Looking it up…
          </span>
        </Show>

        <Show when={Boolean(error)}>
          <p role="alert" className="flex items-center gap-1.5 text-xs text-[var(--fs-error)]">
            <AlertCircle size={13} aria-hidden="true" />
            {error}
          </p>
        </Show>
      </div>
    </Show>
  );
}
