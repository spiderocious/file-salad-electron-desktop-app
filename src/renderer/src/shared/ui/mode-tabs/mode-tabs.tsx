import { Repeat } from 'meemaw';
import { useRef, type KeyboardEvent } from 'react';

export interface ModeTabOption<V extends string = string> {
  readonly value: V;
  readonly label: string;
}

export interface ModeTabsProps<V extends string = string> {
  readonly value: V;
  readonly options: readonly ModeTabOption<V>[];
  readonly onChange: (value: V) => void;
  readonly 'aria-label'?: string;
}

// A compact rounded-full pill tab switcher meant to float over the white drop
// card. Generic over the value type; left/right arrows move selection. Built on
// --fs-* tokens.
export function ModeTabs<V extends string = string>({
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
}: ModeTabsProps<V>) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLButtonElement>): void {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % options.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + options.length) % options.length;
    if (nextIndex === null) return;
    e.preventDefault();
    const nextOption = options[nextIndex];
    if (!nextOption) return;
    onChange(nextOption.value);
    tabsRef.current[nextIndex]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1 rounded-full bg-[var(--fs-surface)] p-1"
    >
      <Repeat each={[...options]}>
        {(option, index) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                tabsRef.current[index] = el;
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={[
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors outline-none',
                'focus-visible:ring-2 focus-visible:ring-[var(--fs-accent)]',
                selected
                  ? 'bg-[var(--fs-accent-subtle)] text-[var(--fs-text)]'
                  : 'text-[var(--fs-text-secondary)] hover:text-[var(--fs-text)]',
              ].join(' ')}
            >
              {option.label}
            </button>
          );
        }}
      </Repeat>
    </div>
  );
}
