/**
 * Tests for src/lib/api-client.ts
 *
 * Unit tests: concrete examples and edge cases
 * Property tests: universal invariants via fast-check
 */

import { AxiosHeaders } from "axios";
import * as fc from "fast-check";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const secureStore: Record<string, string> = {};
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn((key: string) =>
    Promise.resolve(secureStore[key] ?? null),
  ),
  setItemAsync: jest.fn((key: string, val: string) => {
    secureStore[key] = val;
    return Promise.resolve();
  }),
  deleteItemAsync: jest.fn((key: string) => {
    delete secureStore[key];
    return Promise.resolve();
  }),
}));

const mockSignOut = jest.fn().mockResolvedValue(undefined);
jest.mock("@/stores/auth-store", () => ({
  useAuthStore: { getState: () => ({ signOut: mockSignOut }) },
}));

jest.mock("axios", () => {
  const actual = jest.requireActual<typeof import("axios")>("axios");
  return { ...actual, create: actual.create.bind(actual), post: jest.fn() };
});

import { api } from "@/lib/api-client";
import { tokenStorage } from "@/lib/token-storage";
import axios from "axios";

const mockedPost = axios.post as jest.MockedFunction<typeof axios.post>;

// ── Interceptor helpers ───────────────────────────────────────────────────────

/** Build a proper AxiosHeaders object, optionally seeded with plain entries. */
function makeHeaders(init: Record<string, string> = {}): AxiosHeaders {
  const h = new AxiosHeaders();
  for (const [k, v] of Object.entries(init)) h.set(k, v);
  return h;
}

/**
 * Run the request interceptor's fulfilled handler with a minimal config.
 * Returns the mutated config so callers can inspect headers.
 */
async function runReqInterceptor(seed: Record<string, string> = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlers = (api.interceptors.request as any).handlers as Array<{
    fulfilled: (cfg: {
      headers: AxiosHeaders;
    }) => Promise<{ headers: AxiosHeaders }>;
  }>;
  const config = { headers: makeHeaders(seed) };
  return handlers[0].fulfilled(config);
}

/**
 * Push a 401 error through the response interceptor's rejected handler.
 * `extra` is merged into config so tests can set _retry, etc.
 */
function run401(extra: Record<string, unknown> = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlers = (api.interceptors.response as any).handlers as Array<{
    fulfilled: (r: unknown) => unknown;
    rejected: ((e: unknown) => Promise<unknown>) | undefined;
  }>;
  const rejected = handlers[0].rejected;
  if (!rejected) throw new Error("No response interceptor registered");
  const error = {
    response: { status: 401 },
    config: { headers: makeHeaders(), ...extra },
  };
  return rejected(error);
}

// ── Reset between tests ───────────────────────────────────────────────────────

beforeEach(() => {
  Object.keys(secureStore).forEach((k) => delete secureStore[k]);
  jest.clearAllMocks();
});

// ══════════════════════════════════════════════════════════════════════════════
// UNIT TESTS — Request interceptor
// ══════════════════════════════════════════════════════════════════════════════

describe("Request interceptor", () => {
  test("attaches Authorization header when a token exists", async () => {
    await tokenStorage.setAccessToken("my-token");
    const cfg = await runReqInterceptor();
    expect(cfg.headers.get("Authorization")).toBe("Bearer my-token");
  });

  test("does not set Authorization when token is null", async () => {
    const cfg = await runReqInterceptor();
    expect(cfg.headers.get("Authorization")).toBeUndefined();
  });

  test("preserves other headers alongside Authorization", async () => {
    await tokenStorage.setAccessToken("tok");
    const cfg = await runReqInterceptor({ "X-App": "v1" });
    expect(cfg.headers.get("Authorization")).toBe("Bearer tok");
    expect(cfg.headers.get("X-App")).toBe("v1");
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// UNIT TESTS — Response interceptor
// ══════════════════════════════════════════════════════════════════════════════

describe("Response interceptor", () => {
  test("passes non-401 errors through unchanged", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlers = (api.interceptors.response as any).handlers as Array<{
      rejected?: (e: unknown) => Promise<unknown>;
    }>;
    const rejected = handlers[0].rejected!;
    const err = {
      response: { status: 500 },
      config: { headers: makeHeaders() },
    };
    await expect(rejected(err)).rejects.toEqual(err);
  });

  test("does NOT call refresh when _retry is already true", async () => {
    await tokenStorage.setRefreshToken("rt");
    await run401({ _retry: true }).catch(() => {});
    expect(mockedPost).not.toHaveBeenCalled();
  });

  test("calls POST /auth/refresh with the stored refresh token", async () => {
    await tokenStorage.setRefreshToken("refresh-abc");
    mockedPost.mockResolvedValueOnce({ data: { accessToken: "new" } });
    await run401().catch(() => {});
    expect(mockedPost).toHaveBeenCalledWith(
      expect.stringContaining("/auth/refresh"),
      { refreshToken: "refresh-abc" },
    );
  });

  test("writes the new access token to storage after successful refresh", async () => {
    await tokenStorage.setRefreshToken("rt");
    mockedPost.mockResolvedValueOnce({
      data: { accessToken: "refreshed-token" },
    });
    await run401().catch(() => {});
    expect(await tokenStorage.getAccessToken()).toBe("refreshed-token");
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// UNIT TESTS — Sign-out on refresh failure
// ══════════════════════════════════════════════════════════════════════════════

describe("Sign-out on refresh failure", () => {
  test("clears both tokens when refresh fails", async () => {
    await tokenStorage.setTokens("at", "rt");
    mockedPost.mockRejectedValueOnce(new Error("network error"));
    await run401().catch(() => {});
    expect(await tokenStorage.getAccessToken()).toBeNull();
    expect(await tokenStorage.getRefreshToken()).toBeNull();
  });

  test("calls signOut exactly once when refresh fails", async () => {
    await tokenStorage.setRefreshToken("rt");
    mockedPost.mockRejectedValueOnce(new Error("server error"));
    await run401().catch(() => {});
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  test("rejects the original promise with the refresh error", async () => {
    await tokenStorage.setRefreshToken("rt");
    mockedPost.mockRejectedValueOnce(new Error("refresh down"));
    await expect(run401()).rejects.toThrow("refresh down");
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// PROPERTY-BASED TESTS
// ══════════════════════════════════════════════════════════════════════════════

describe("Property tests", () => {
  // Feature: api-client, Property 1: Token is always attached when present
  test("P1 — for any non-empty token, Authorization is always Bearer <token>", async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1 }), async (token) => {
        Object.keys(secureStore).forEach((k) => delete secureStore[k]);
        await tokenStorage.setAccessToken(token);
        const cfg = await runReqInterceptor();
        expect(cfg.headers.get("Authorization")).toBe(`Bearer ${token}`);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: api-client, Property 2: No Authorization header when token is absent
  test("P2 — when storage has no token, Authorization header is never set", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        Object.keys(secureStore).forEach((k) => delete secureStore[k]);
        const cfg = await runReqInterceptor();
        expect(cfg.headers.get("Authorization")).toBeUndefined();
      }),
      { numRuns: 100 },
    );
  });

  // Feature: api-client, Property 3: Exactly one refresh fires for N concurrent 401s
  test("P3 — for N concurrent 401s, refresh endpoint is called exactly once", async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 2, max: 6 }), async (n) => {
        jest.clearAllMocks();
        Object.keys(secureStore).forEach((k) => delete secureStore[k]);
        await tokenStorage.setRefreshToken("rt");

        // Delayed refresh so concurrent requests queue up
        mockedPost.mockImplementationOnce(
          () =>
            new Promise((res) =>
              setTimeout(() => res({ data: { accessToken: "newTok" } }), 5),
            ),
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handlers = (api.interceptors.response as any).handlers as Array<{
          rejected?: (e: unknown) => Promise<unknown>;
        }>;
        const rejected = handlers[0].rejected!;
        const makeErr = () => ({
          response: { status: 401 },
          config: { headers: makeHeaders() },
        });

        await Promise.allSettled(
          Array.from({ length: n }, () => rejected(makeErr())),
        );

        expect(mockedPost).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 40 },
    );
  });

  // Feature: api-client, Property 4: Queued requests get new token in storage
  test("P4 — after successful refresh, new token is persisted for any token value", async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1 }), async (newToken) => {
        jest.clearAllMocks();
        Object.keys(secureStore).forEach((k) => delete secureStore[k]);
        await tokenStorage.setRefreshToken("rt");

        mockedPost.mockResolvedValueOnce({ data: { accessToken: newToken } });
        await run401().catch(() => {});

        expect(await tokenStorage.getAccessToken()).toBe(newToken);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: api-client, Property 5: Retry loop prevention
  test("P5 — when _retry is true, refresh endpoint is never called", async () => {
    await fc.assert(
      fc.asyncProperty(fc.string(), async (token) => {
        jest.clearAllMocks();
        await tokenStorage.setAccessToken(token);
        await run401({ _retry: true }).catch(() => {});
        expect(mockedPost).not.toHaveBeenCalled();
      }),
      { numRuns: 100 },
    );
  });

  // Feature: api-client, Property 6: Sign-out on refresh failure is total
  test("P6 — on any refresh failure: tokens cleared AND signOut called", async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ minLength: 1 }), async (errMsg) => {
        jest.clearAllMocks();
        Object.keys(secureStore).forEach((k) => delete secureStore[k]);
        await tokenStorage.setTokens("at", "rt");

        mockedPost.mockRejectedValueOnce(new Error(errMsg));
        await run401().catch(() => {});

        expect(await tokenStorage.getAccessToken()).toBeNull();
        expect(await tokenStorage.getRefreshToken()).toBeNull();
        expect(mockSignOut).toHaveBeenCalledTimes(1);
      }),
      { numRuns: 100 },
    );
  });
});
