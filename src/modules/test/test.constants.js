/**
 * Default values applied when query parameters are omitted.
 *
 * @typedef {Object} TestDefaults
 * @property {number} DELAY_SECONDS - Default simulated delay in seconds.
 * @property {number} STATUS_CODE - Default HTTP status code.
 * @property {string} RESPONSE - Default response payload.
 */

/**
 * Default values applied when the corresponding query parameters are omitted.
 *
 * @type {TestDefaults}
 */
export const TEST_DEFAULTS = Object.freeze({
  DELAY_SECONDS: 0,
  STATUS_CODE: 200,
  RESPONSE: 'Request completed successfully',
});

/**
 * Hard limits imposed on the `delay` query parameter, expressed in seconds.
 *
 * @typedef {Object} TestLimits
 * @property {number} MIN_DELAY_SECONDS - Minimum accepted delay in seconds.
 * @property {number} MAX_DELAY_SECONDS - Maximum accepted delay in seconds.
 */

/**
 * Hard limits imposed on the `delay` query parameter, expressed in seconds.
 *
 * @type {TestLimits}
 */
export const TEST_LIMITS = Object.freeze({
  MIN_DELAY_SECONDS: 0,
  MAX_DELAY_SECONDS: 30,
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

/**
 * Hard limits imposed on the `id` path parameter of the `/test/:id` endpoint.
 *
 * @typedef {Object} TestIdLimits
 * @property {number} MIN_LENGTH - Minimum accepted length in characters.
 * @property {number} MAX_LENGTH - Maximum accepted length in characters.
 */

/**
 * Hard limits imposed on the `id` path parameter of the `/test/:id` endpoint.
 *
 * @type {TestIdLimits}
 */
export const TEST_ID_LIMITS = Object.freeze({
  MIN_LENGTH: 1,
  MAX_LENGTH: 64,
});

/**
 * Accepted character set for the `id` path parameter.
 *
 * Kept conservative so the identifier stays URL-safe and always renders as a
 * single, unambiguous path segment.
 *
 * @type {RegExp}
 */
export const TEST_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
