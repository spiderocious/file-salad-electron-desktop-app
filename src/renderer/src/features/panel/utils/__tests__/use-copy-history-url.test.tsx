import { renderHook, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestWrapper } from '../../../../test-utils/create-test-wrapper.tsx';
import { installBridgeMock } from '../../../../test-utils/bridge-mock.ts';
import { useCopyHistoryUrl } from '../use-copy-history-url.ts';
import type { UploadListItem } from '../../../../../../shared/types/upload.ts';

function entry(over: Partial<UploadListItem> = {}): UploadListItem {
  return {
    id: 'up_test',
    filename: 'a.png',
    key: 'f_test',
    size: 10,
    timestamp: '2026-05-22T10:00:00Z',
    mode: 'hosted',
    cachedUrl: 'https://files.example.com/cached',
    cachedExpiresAt: '2099-01-01T00:00:00Z',
    ...over,
  };
}

let lastCopied: string | null = null;

beforeEach(() => {
  lastCopied = null;
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn(async (t: string) => { lastCopied = t; }) },
  });
});

describe('useCopyHistoryUrl (electron)', () => {
  it('copies the cached URL when not expired (no refresh)', async () => {
    installBridgeMock();
    const { result } = renderHook(() => useCopyHistoryUrl(), { wrapper: createTestWrapper() });
    act(() => result.current.copy(entry()));
    await waitFor(() => expect(result.current.status).toBe('copied'));
    expect(lastCopied).toBe('https://files.example.com/cached');
  });

  it('refetches via the bridge when expired, then copies the fresh URL', async () => {
    installBridgeMock();
    const { result } = renderHook(() => useCopyHistoryUrl(), { wrapper: createTestWrapper() });
    act(() => result.current.copy(entry({ cachedExpiresAt: '2000-01-01T00:00:00Z' })));
    await waitFor(() => expect(result.current.status).toBe('copied'));
    expect(lastCopied).toBe('https://files.example.com/fresh');
  });

  it('shows an error when the refresh fails', async () => {
    installBridgeMock();
    (window.fileSalad.upload.refreshUrl as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('gone'),
    );
    const { result } = renderHook(() => useCopyHistoryUrl(), { wrapper: createTestWrapper() });
    act(() => result.current.copy(entry({ cachedExpiresAt: '2000-01-01T00:00:00Z' })));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.errorMessage).toMatch(/expired|unavailable/i);
  });
});
