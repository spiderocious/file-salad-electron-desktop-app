import { useQueryClient } from '@tanstack/react-query';
import { Button, FieldLabel, SegmentControl, TextInput, toast } from 'file-salad-ui-lib';
import { Show } from 'meemaw';
import { useState } from 'react';
import { z } from 'zod';

import { Logo } from '@shared/ui/logo/logo.tsx';
import { ApiError } from '@shared/services/api-error.ts';

import { byokStatusQueryKey } from '../../settings/api/use-byok-status.ts';
import { ByokForm } from '../../settings/parts/byok-form.tsx';
import { useLogin } from '../api/use-login.ts';
import { useRegister } from '../api/use-register.ts';
import { meQueryKey } from '../api/use-me.ts';

type Mode = 'signin' | 'register';
type View = 'auth' | 'byok';

const credentialsSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Needs an uppercase letter')
    .regex(/[a-z]/, 'Needs a lowercase letter')
    .regex(/\d/, 'Needs a number'),
});

// First screen for an unauthenticated user. They can sign in / create an
// account, or skip auth entirely and connect their own storage (BYOK). Inline
// errors throughout — never toasts for things the user must fix.
export function AuthScreen() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>('auth');
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const login = useLogin();
  const register = useRegister();
  const pending = login.isPending || register.isPending;

  function onAuthSuccess(): void {
    void queryClient.invalidateQueries({ queryKey: meQueryKey() });
  }

  function mapError(error: unknown): string {
    if (error instanceof ApiError) {
      if (error.is('invalid_credentials')) return 'Wrong email or password.';
      if (error.is('email_exists')) return 'An account with that email already exists.';
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

    const onError = (error: unknown): void => setFormError(mapError(error));
    if (mode === 'signin') {
      login.mutate(parsed.data, { onSuccess: onAuthSuccess, onError });
    } else {
      register.mutate(parsed.data, { onSuccess: onAuthSuccess, onError });
    }
  }

  return (
    <div className="flex h-screen flex-col bg-[var(--fs-bg)] px-5 py-6">
      <div className="mb-5 flex justify-center">
        <Logo />
      </div>

      <Show
        when={view === 'auth'}
        fallback={
          <div className="flex flex-1 flex-col overflow-y-auto">
            <p className="mb-3 text-sm text-[var(--fs-text-secondary)]">
              Connect your own S3, R2, Tigris or GCS bucket. Your keys stay on this device.
            </p>
            <ByokForm
              submitLabel="Connect & continue"
              onSaved={() =>
                queryClient.invalidateQueries({ queryKey: byokStatusQueryKey() })
              }
            />
            <button
              type="button"
              onClick={() => setView('auth')}
              className="mt-4 text-center text-xs font-medium text-[var(--fs-accent)] hover:underline"
            >
              Back to sign in
            </button>
          </div>
        }
      >
        <div className="flex flex-1 flex-col">
          <SegmentControl
            aria-label="Authentication mode"
            value={mode}
            options={[
              { value: 'signin', label: 'Sign in' },
              { value: 'register', label: 'Create account' },
            ]}
            onChange={(value) => {
              setMode(value as Mode);
              setFormError(null);
              setFieldError(null);
            }}
          />

          <div className="mt-4 flex flex-col gap-3">
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
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </div>

          <button
            type="button"
            onClick={() => {
              setView('byok');
              toast.info('Set up your own storage');
            }}
            className="mt-auto pt-4 text-center text-xs font-medium text-[var(--fs-accent)] hover:underline"
          >
            Use my own storage instead
          </button>
        </div>
      </Show>
    </div>
  );
}
