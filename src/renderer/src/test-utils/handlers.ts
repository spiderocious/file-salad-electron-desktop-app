import { http, HttpResponse } from 'msw';

import { ENV } from '@shared/config/env.ts';
import { EP } from '@shared/constants/endpoints.ts';

const base = `${ENV.API_BASE_URL}/api/v1`;

const session = {
  user: { id: 'u_test', email: 'alice@test.test', created_at: '2026-05-21T00:00:00Z' },
  access_token: 'access_test',
  refresh_token: 'refresh_test',
  expires_in: 900,
};

export const handlers = [
  http.post(`${base}${EP.AUTH.LOGIN}`, () => HttpResponse.json({ data: session })),
  http.post(`${base}${EP.AUTH.REGISTER}`, () =>
    HttpResponse.json({ data: session }, { status: 201 }),
  ),
  http.post(`${base}${EP.AUTH.LOGOUT}`, () => new HttpResponse(null, { status: 204 })),
  http.get(`${base}${EP.ME}`, () => HttpResponse.json({ data: { user: session.user } })),
];
