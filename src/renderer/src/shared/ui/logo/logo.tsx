import { Salad } from '@icons';

interface LogoProps {
  readonly className?: string;
  // Wordmark color: 'brand' (accent green) for light surfaces, 'inverse' (white)
  // for the gradient canvas.
  readonly tone?: 'brand' | 'inverse';
}

// Standalone brand mark so the wordmark is reused across the header, drawers,
// and empty states without duplication (per idea.md). Colors reference the
// file-salad-ui-lib design tokens.
export function Logo({ className, tone = 'brand' }: LogoProps) {
  const color = tone === 'inverse' ? 'text-white' : 'text-[var(--fs-text)]';
  const mark = tone === 'inverse' ? 'text-white' : 'text-[var(--fs-accent)]';
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-semibold tracking-tight ${color} ${className ?? ''}`}
      style={{ fontFamily: 'var(--fs-font-sans)' }}
    >
      <Salad size={18} className={mark} aria-hidden="true" />
      <span>
        file<span className="font-bold">salad</span>
      </span>
    </span>
  );
}
