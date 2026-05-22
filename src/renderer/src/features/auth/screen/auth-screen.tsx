import { useQueryClient } from '@tanstack/react-query';
import { Button, FieldLabel, TextInput } from 'file-salad-ui-lib';
import { Show } from 'meemaw';
import { useState } from 'react';
import { z } from 'zod';

import { Salad } from '@icons';
import { ApiError } from '@shared/services/api-error.ts';

import { useLogin } from '../api/use-login.ts';
import { useRegister } from '../api/use-register.ts';
import { meQueryKey } from '../api/use-me.ts';

type Mode = 'signin' | 'register';

interface AuthScreenProps {
  // Switch the drawer to BYOK setup ("use my own storage instead").
  readonly onUseOwnStorage: () => void;
  // Called after a successful sign-in / register (lets the host close/refresh).
  readonly onAuthenticated?: () => void;
}

const credentialsSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Needs an uppercase letter')
    .regex(/[a-z]/, 'Needs a lowercase letter')
    .regex(/\d/, 'Needs a number'),
});

// Login by default, with a header. A single inline link toggles to "create
// account" (and back) — no tabs. Inline errors throughout.
export function AuthScreen({ onUseOwnStorage, onAuthenticated }: AuthScreenProps) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const login = useLogin();
  const register = useRegister();
  const pending = login.isPending || register.isPending;
  const isSignin = mode === 'signin';

  function mapError(error: unknown): string {
    if (error instanceof ApiError) {
      if (error.is('invalid_credentials')) return 'Wrong email or password.';
      if (error.is('email_exists')) return 'We can\'t create an account with that email.';
      if (error.is('validation_error')) return error.message || 'Check your details and try again.';
    }
    return 'Something went wrong. Please try again.';
  }

  function handleSubmit(): void {
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? 'Check your details.');
      return;
    }
    setFieldError(null);
    setFormError(null);

    const onSuccess = (): void => {
      void queryClient.invalidateQueries({ queryKey: meQueryKey() });
      onAuthenticated?.();
    };
    const onError = (error: unknown): void => setFormError(mapError(error));
    if (isSignin) login.mutate(parsed.data, { onSuccess, onError });
    else register.mutate(parsed.data, { onSuccess, onError });
  }

  function toggleMode(): void {
    setMode(isSignin ? 'register' : 'signin');
    setFieldError(null);
    setFormError(null);
  }

  return (
    <div className="flex flex-col">
      <header className="mb-5 flex flex-col items-center text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--fs-accent-subtle)]">
          <Salad className="text-[var(--fs-accent)]" size={26} aria-hidden="true" />
        </span>
        <h1 className="text-lg font-semibold text-[var(--fs-text)]">
          {isSignin ? 'Welcome back' : 'Create your account'}
        </h1>
        <p className="mt-1 text-sm text-[var(--fs-text-secondary)]">
          {isSignin
            ? 'Sign in to upload to FileSalad.'
            : 'Sign up to start sharing files in two clicks.'}
        </p>
      </header>

      <div className="flex flex-col gap-3">
        <div>
          <FieldLabel required>Email</FieldLabel>
          <TextInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <FieldLabel required>Password</FieldLabel>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
        </div>

        <Show when={Boolean(fieldError)}>
          <p role="alert" className="text-sm text-[var(--fs-error)]">
            {fieldError}
          </p>
        </Show>
        <Show when={Boolean(formError)}>
          <p role="alert" className="text-sm text-[var(--fs-error)]">
            {formError}
          </p>
        </Show>

        <Button onClick={handleSubmit} loading={pending}>
          {isSignin ? 'Sign in' : 'Create account'}
        </Button>

        {/* The toggle lives directly above/below the action, not as tabs. */}
        <p className="text-center text-sm text-[var(--fs-text-secondary)]">
          {isSignin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={toggleMode}
            className="font-medium text-[var(--fs-accent)] hover:underline"
          >
            {isSignin ? 'Create account' : 'Sign in'}
          </button>
        </p>
      </div>

      <div className="mt-4 border-t border-[var(--fs-border)] pt-4">
        <button
          type="button"
          onClick={onUseOwnStorage}
          className="w-full text-center text-xs font-medium text-[var(--fs-accent)] hover:underline"
        >
          Use my own storage instead
        </button>
      </div>
    </div>
  );
}
