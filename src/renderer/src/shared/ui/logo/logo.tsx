import { cn } from '@shared/utils/cn';

interface LogoProps {
  readonly className?: string;
}

// Standalone so the wordmark is reused across the header, settings, and any
// empty states without duplication (per idea.md). Colors reference the
// file-salad-ui-lib design tokens (--fs-*) rather than hardcoded values.
export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn(
        'text-sm font-semibold tracking-tight text-[var(--fs-text)]',
        className,
      )}
      style={{ fontFamily: 'var(--fs-font-sans)' }}
    >
      File<span className="text-[var(--fs-accent)]">Salad</span>
    </span>
  );
}
