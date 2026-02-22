/**
 * Centralized application configuration.
 *
 * Environment-specific values are read from `NEXT_PUBLIC_*` env vars so
 * Next.js can inline them at build time for both server and client bundles.
 *
 * To switch environments, set the variables in:
 *   - `.env.local`        -> local development  (git-ignored)
 *   - `.env.development`  -> shared dev defaults (committed)
 *   - `.env.production`   -> production defaults (committed)
 *   - Vercel dashboard    -> deployed environments
 */

// ─── API ────────────────────────────────────────────────────────────────────

/** Base URL of the Rails backend (no trailing slash). */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

/** When true the service layer uses in-memory mock data instead of fetch. */
export const USE_MOCK = !API_BASE_URL

/** Timeout in ms for every fetch call to the backend. */
export const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 10_000)

// ─── Pagination ─────────────────────────────────────────────────────────────

/** Default number of products per page. */
export const DEFAULT_PER_PAGE = Number(
  process.env.NEXT_PUBLIC_DEFAULT_PER_PAGE ?? 10
)

// ─── Feature flags ──────────────────────────────────────────────────────────

/** Artificial delay (ms) added to mock responses to simulate network latency. */
export const MOCK_DELAY = Number(process.env.NEXT_PUBLIC_MOCK_DELAY ?? 400)

// ─── Export a typed object for convenience ──────────────────────────────────

export const config = {
  api: {
    baseUrl: API_BASE_URL,
    timeout: API_TIMEOUT,
    useMock: USE_MOCK,
  },
  pagination: {
    defaultPerPage: DEFAULT_PER_PAGE,
  },
  mock: {
    delay: MOCK_DELAY,
  },
} as const
