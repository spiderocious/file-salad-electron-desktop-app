import { Repeat } from 'meemaw';
import { useId, useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from 'react';

export interface OtpInputProps {
  readonly length?: number;
  readonly value: string;
  readonly onChange: (value: string) => void;
  // Fires once every cell is filled.
  readonly onComplete?: (value: string) => void;
  readonly disabled?: boolean;
  readonly autoFocus?: boolean;
  readonly 'aria-label'?: string;
}

// Confusable-free share-code alphabet: digits 2-9 and A-Z minus I, L, O.
const ALLOWED = /[2-9A-HJ-NP-Z]/i;

function sanitize(raw: string): string {
  return [...raw]
    .filter((c) => ALLOWED.test(c))
    .map((c) => c.toUpperCase())
    .join('');
}

// Animated, accessible share-code input: one single-char cell per slot with
// auto-advance, backspace-to-previous, arrow navigation, and multi-char paste.
// Controlled — the parent owns the string via value/onChange. --fs-* tokens.
export function OtpInput({
  length = 7,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = false,
  'aria-label': ariaLabel,
}: OtpInputProps) {
  const groupId = useId();
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const cells = Array.from({ length }, (_, i) => i);

  function focusCell(index: number): void {
    const el = inputsRef.current[index];
    if (el) el.focus();
  }

  function commit(next: string): void {
    const capped = next.slice(0, length);
    onChange(capped);
    if (capped.length === length) onComplete?.(capped);
  }

  function handleChange(index: number, e: ChangeEvent<HTMLInputElement>): void {
    const sanitized = sanitize(e.target.value);
    if (!sanitized) return;

    const chars = value.padEnd(length, ' ').split('');
    // Type one char into this cell, then spill the rest into following cells
    // (covers fast typing where multiple characters land in one event).
    let cursor = index;
    for (const ch of sanitized) {
      if (cursor >= length) break;
      chars[cursor] = ch;
      cursor += 1;
    }
    commit(chars.join('').replace(/ +$/, ''));
    focusCell(Math.min(cursor, length - 1));
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const chars = value.padEnd(length, ' ').split('');
      if (chars[index] && chars[index] !== ' ') {
        chars[index] = ' ';
        commit(chars.join('').replace(/ +$/, ''));
      } else if (index > 0) {
        chars[index - 1] = ' ';
        commit(chars.join('').replace(/ +$/, ''));
        focusCell(index - 1);
      }
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusCell(index - 1);
      return;
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      focusCell(index + 1);
    }
  }

  function handlePaste(index: number, e: ClipboardEvent<HTMLInputElement>): void {
    e.preventDefault();
    const pasted = sanitize(e.clipboardData.getData('text'));
    if (!pasted) return;
    const chars = value.padEnd(length, ' ').split('');
    let cursor = index;
    for (const ch of pasted) {
      if (cursor >= length) break;
      chars[cursor] = ch;
      cursor += 1;
    }
    commit(chars.join('').replace(/ +$/, ''));
    focusCell(Math.min(cursor, length - 1));
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex items-center justify-center gap-1.5"
    >
      <Repeat each={cells}>
        {(index) => {
          const char = value[index] ?? '';
          const isFilled = char !== '';
          return (
            <input
              key={`${groupId}-${index}`}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={1}
              disabled={disabled}
              autoFocus={autoFocus && index === 0}
              aria-label={`Character ${index + 1}`}
              value={char}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handlePaste(index, e)}
              onFocus={(e) => e.currentTarget.select()}
              className={[
                'h-10 w-9 rounded-lg border bg-[var(--fs-surface)] text-center text-base font-semibold uppercase text-[var(--fs-text)]',
                'caret-[var(--fs-accent)] outline-none transition-colors',
                'focus-visible:ring-2 focus-visible:ring-[var(--fs-accent)]',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isFilled
                  ? 'fs-otp-pop border-[var(--fs-accent)]'
                  : 'fs-otp-empty border-[var(--fs-border)]',
              ].join(' ')}
            />
          );
        }}
      </Repeat>
    </div>
  );
}
