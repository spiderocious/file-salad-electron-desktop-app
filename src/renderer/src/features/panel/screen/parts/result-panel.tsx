import { Button, CopyableLink, toast } from 'file-salad-ui-lib';

import { LinkIcon } from '@icons';
import { getBridge } from '@shared/services/bridge.ts';

interface ResultPanelProps {
  readonly title: string;
  readonly filename?: string;
  readonly url: string;
  readonly resetLabel: string;
  readonly onReset: () => void;
}

// Shared result surface for a finished upload and a redeemed code: the link with
// copy, plus Open (opens in the system browser via main — never inside the tiny
// panel), and a reset.
export function ResultPanel({ title, filename, url, resetLabel, onReset }: ResultPanelProps) {
  return (
    <div className="w-full rounded-xl border border-[var(--fs-border)] bg-[var(--fs-bg)] p-3 shadow-sm">
      <p className="mb-1 text-center text-xs font-medium text-[var(--fs-text-secondary)]">{title}</p>
      {filename ? (
        <p className="mb-2 truncate text-center text-xs text-[var(--fs-text-tertiary)]">
          {filename}
        </p>
      ) : null}

      <CopyableLink url={url} onCopy={() => toast.success('Link copied')} />

      <Button
        variant="secondary"
        size="sm"
        className="mt-2 w-full"
        leadingIcon={<LinkIcon size={14} />}
        onClick={() => getBridge().openExternal(url)}
      >
        Open
      </Button>

      <button
        type="button"
        onClick={onReset}
        className="mt-2 w-full text-center text-xs font-medium text-[var(--fs-accent)] hover:underline"
      >
        {resetLabel}
      </button>
    </div>
  );
}
