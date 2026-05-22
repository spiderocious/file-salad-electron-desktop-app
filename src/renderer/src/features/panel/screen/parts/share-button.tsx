import { Button, CopyableLink, toast } from 'file-salad-ui-lib';
import { Show } from 'meemaw';

import { LinkIcon } from '@icons';
import { shareLink } from '@shared/config/env.ts';

import { useShareCode } from '../../api/use-share.ts';

interface ShareButtonProps {
  readonly uploadId: string;
}

// Mints a short share code for a hosted upload and shows the friendly /s/CODE
// link (re-redeemable ~24h). Only rendered for hosted uploads — BYOK uploads
// never reached our backend, so they can't be shared this way.
export function ShareButton({ uploadId }: ShareButtonProps) {
  const share = useShareCode();

  return (
    <Show
      when={share.isSuccess && Boolean(share.data)}
      fallback={
        <Button
          variant="quiet"
          size="sm"
          className="w-full"
          loading={share.isPending}
          leadingIcon={<LinkIcon size={14} />}
          onClick={() => share.mutate(uploadId)}
        >
          Create share code
        </Button>
      }
    >
      <div className="rounded-lg bg-[var(--fs-surface)] p-2">
        <p className="mb-1 text-center text-[11px] text-[var(--fs-text-secondary)]">
          Anyone with this link can download for 24h
        </p>
        {share.data ? (
          <CopyableLink
            url={shareLink(share.data.code)}
            onCopy={() => toast.success('Share link copied')}
          />
        ) : null}
      </div>
    </Show>
  );
}
