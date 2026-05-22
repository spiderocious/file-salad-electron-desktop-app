import { Check } from '@icons';
import { Repeat, Show } from 'meemaw';
import { useEffect, useId, useRef, useState } from 'react';

export interface SelectOption<V extends string = string> {
  readonly value: V;
  readonly label: string;
}

export interface SelectProps<V extends string = string> {
  readonly value: V;
  readonly options: readonly SelectOption<V>[];
  readonly onChange: (value: V) => void;
  readonly 'aria-label'?: string;
}

// A small accessible dropdown (button + popover list). Used for the storage
// provider choice instead of a segment control. --fs-* tokens; closes on
// outside-click or Escape.
export function Select<V extends string = string>({
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
}: SelectProps<V>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return undefined;
    function onDocClick(e: MouseEvent): void {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') setOpen(false);
    }
    // `click` (not `mousedown`) so an option's own click handler runs first;
    // mousedown would race the selection on some event orderings.
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-[var(--fs-border)] bg-[var(--fs-bg)] px-3 py-2 text-left text-sm text-[var(--fs-text)] hover:border-[var(--fs-border-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fs-accent)]"
      >
        <span>{selected?.label ?? 'Select…'}</span>
        <span className="text-[var(--fs-text-tertiary)]">▾</span>
      </button>

      <Show when={open}>
        <ul
          id={listId}
          role="listbox"
          className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-[var(--fs-border)] bg-[var(--fs-bg)] py-1 shadow-lg"
        >
          <Repeat each={[...options]}>
            {(option) => (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-[var(--fs-text)] hover:bg-[var(--fs-surface-hover)]"
                >
                  {option.label}
                  <Show when={option.value === value}>
                    <Check size={14} className="text-[var(--fs-accent)]" aria-hidden="true" />
                  </Show>
                </button>
              </li>
            )}
          </Repeat>
        </ul>
      </Show>
    </div>
  );
}
