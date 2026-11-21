import { register } from '@/instrumentation';
import logger from '@/lib/logger';

const mockRefreshSites = jest.fn();
jest.mock('@eidosmedia/neon-frontoffice-ts-sdk', () => ({
  NeonConnection: jest.fn().mockImplementation(() => ({
    startup: jest.fn().mockResolvedValue(undefined),
    refreshSites: mockRefreshSites,
  })),
}));
jest.mock('@/lib/logger', () => ({ __esModule: true, default: { error: jest.fn() } }));

test('periodic site refresh failures are handled and subsequent refreshes continue', async () => {
  const oldConnection = globalThis.connection;
  const oldUrl = process.env.BASE_NEON_FO_URL;
  const oldKey = process.env.NEON_FRONTOFFICE_SERVICE_KEY;
  jest.useFakeTimers();
  process.env.BASE_NEON_FO_URL = 'https://neon.test';
  process.env.NEON_FRONTOFFICE_SERVICE_KEY = 'test';
  const failure = { status: 502, url: 'https://neon.test/api/sites/preview' };
  mockRefreshSites.mockRejectedValueOnce(failure).mockResolvedValue([]);
  try {
    await register();
    await jest.runOnlyPendingTimersAsync();
    expect(logger.error).toHaveBeenCalledWith(
      { event: 'site-refresh-failed', err: failure },
      'Unable to refresh sites; retaining the last successful site list',
    );
    await jest.runOnlyPendingTimersAsync();
    expect(mockRefreshSites).toHaveBeenCalledTimes(2);
    expect(logger.error).toHaveBeenCalledTimes(1);
  } finally {
    jest.clearAllTimers();
    jest.useRealTimers();
    globalThis.connection = oldConnection;
    if (oldUrl === undefined) delete process.env.BASE_NEON_FO_URL;
    else process.env.BASE_NEON_FO_URL = oldUrl;
    if (oldKey === undefined) delete process.env.NEON_FRONTOFFICE_SERVICE_KEY;
    else process.env.NEON_FRONTOFFICE_SERVICE_KEY = oldKey;
  }
});
