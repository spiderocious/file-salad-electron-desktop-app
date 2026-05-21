import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';

import { installBridgeMock } from './src/renderer/src/test-utils/bridge-mock.ts';
import { server } from './src/renderer/src/test-utils/server.ts';

// Fail loudly on any backend request the handlers don't cover.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// A default signed-out bridge before each test; tests re-install with scenario
// state as needed.
beforeEach(() => installBridgeMock());
