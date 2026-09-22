/**
 * Default values applied when query parameters are omitted.
 *
 * @typedef {Object} TestDefaults
 * @property {number} DELAY_MS - Default simulated delay in milliseconds.
 * @property {number} STATUS_CODE - Default HTTP status code.
 * @property {string} RESPONSE - Default response payload.
 */

/**
 * Default values applied when the corresponding query parameters are omitted.
 *
 * @type {TestDefaults}
 */
export const TEST_DEFAULTS = Object.freeze({
  DELAY_MS: 0,
  STATUS_CODE: 200,
  RESPONSE: 'Request completed successfully',
});

/**
 * Hard limits imposed on the `delay` query parameter.
 *
 * @typedef {Object} TestLimits
 * @property {number} MIN_DELAY_MS - Minimum accepted delay in milliseconds.
 * @property {number} MAX_DELAY_MS - Maximum accepted delay in milliseconds.
 */

/**
 * Hard limits imposed on the `delay` query parameter.
 *
 * @type {TestLimits}
 */
export const TEST_LIMITS = Object.freeze({
  MIN_DELAY_MS: 0,
  MAX_DELAY_MS: 30_000,
});

/**
 * HTTP status codes the test endpoint is allowed to return.
 *
 * We intentionally allow only the status codes that make sense for our
 * testing endpoint: common successes, client errors, and the server errors
 * one might realistically want to simulate.
 *
 * @type {Set<number>}
 */
export const ALLOWED_STATUS_CODES = new Set([
  // Success
  200, 201, 202, 204,

  // Client errors
  400, 401, 403, 404, 409, 422, 429,

  // Server errors
  500, 501, 502, 503, 504,
]);
