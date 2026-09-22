import { ApiError } from '../../utils/Error/ApiError.js';
import {
  ALLOWED_STATUS_CODES,
  TEST_DEFAULTS,
  TEST_LIMITS,
} from './test.constants.js';

/**
 * Returns a single query-parameter value, rejecting duplicates.
 *
 * When a client repeats a query parameter, Express exposes it as an array.
 * Every parameter on this endpoint is single-valued, so an array is rejected
 * with a client error rather than silently taking the first element.
 *
 * @param {string|string[]|undefined} value - Raw query parameter value.
 * @param {string} fieldName - Name of the parameter, used in the error message.
 * @returns {string} The single raw value.
 * @throws {import('../../utils/Error/ApiError.js').ApiError} Code `DUPLICATE_QUERY_PARAMETER`
 *    when the parameter is provided more than once.
 */
function getSingleValue(value, fieldName) {
  if (Array.isArray(value)) {
    throw new ApiError(
      `${fieldName} must be provided only once`,
      400,
      'DUPLICATE_QUERY_PARAMETER',
    );
  }

  return value;
}

/**
 * Parses and validates the `delay` query parameter, in seconds.
 *
 * Falls back to the default delay when the parameter is omitted; otherwise
 * requires a non-negative number (integer or fractional) within the documented
 * limits.
 *
 * The value is kept in seconds so the API contract stays unit-consistent. Unit
 * conversion to milliseconds is a separate concern handled by the executor
 * (single responsibility principle).
 *
 * @param {string|string[]|undefined} value - Raw `delay` query parameter value.
 * @returns {number} The validated delay in seconds.
 * @throws {import('../../utils/Error/ApiError.js').ApiError} When the value is
 *    a duplicate, not a non-negative number, not finite, or beyond
 *    {@link TEST_LIMITS}.
 */
function parseDelay(value) {
  if (value === undefined) {
    return TEST_DEFAULTS.DELAY_SECONDS;
  }

  const rawValue = getSingleValue(value, 'delay');

  if (!/^\d+(\.\d+)?$/.test(rawValue)) {
    throw new ApiError(
      'delay must be a non-negative number of seconds',
      400,
      'INVALID_DELAY',
    );
  }

  const delaySeconds = Number(rawValue);

  if (!Number.isFinite(delaySeconds)) {
    throw new ApiError(
      'delay is outside the supported range',
      400,
      'INVALID_DELAY',
    );
  }

  if (
    delaySeconds < TEST_LIMITS.MIN_DELAY_SECONDS ||
    delaySeconds > TEST_LIMITS.MAX_DELAY_SECONDS
  ) {
    throw new ApiError(
      `delay must be between ${TEST_LIMITS.MIN_DELAY_SECONDS} and ${TEST_LIMITS.MAX_DELAY_SECONDS} seconds`,
      400,
      'DELAY_OUT_OF_RANGE',
    );
  }

  return delaySeconds;
}

/**
 * Parses and validates the `statusCode` query parameter.
 *
 * Falls back to the default status code when the parameter is omitted;
 * otherwise requires an integer from {@link ALLOWED_STATUS_CODES} that is
 * within the safe-integer range.
 *
 * @param {string|string[]|undefined} value - Raw `statusCode` query parameter value.
 * @returns {number} The validated HTTP status code.
 * @throws {import('../../utils/Error/ApiError.js').ApiError} When the value is
 *    a duplicate, not an integer, outside the supported range, or not in
 *    {@link ALLOWED_STATUS_CODES}.
 */
function parseStatusCode(value) {
  if (value === undefined) {
    return TEST_DEFAULTS.STATUS_CODE;
  }

  const rawValue = getSingleValue(value, 'statusCode');

  if (!/^\d+$/.test(rawValue)) {
    throw new ApiError(
      'statusCode must be an integer',
      400,
      'INVALID_STATUS_CODE',
    );
  }

  const statusCode = Number(rawValue);

  if (!Number.isSafeInteger(statusCode)) {
    throw new ApiError(
      'statusCode is outside the supported range',
      400,
      'INVALID_STATUS_CODE',
    );
  }

  if (!ALLOWED_STATUS_CODES.has(statusCode)) {
    throw new ApiError(
      `statusCode ${statusCode} is not supported`,
      400,
      'UNSUPPORTED_STATUS_CODE',
    );
  }

  return statusCode;
}

/**
 * Parses the `response` query parameter.
 *
 * Falls back to the default response when the parameter is omitted. Empty
 * values are kept as an empty string; values that parse as JSON are returned
 * as their parsed equivalent; anything else is treated as a plain string.
 *
 * @param {string|string[]|undefined} value - Raw `response` query parameter value.
 * @returns {*} The parsed response payload (parsed JSON, plain string, or the default).
 * @throws {import('../../utils/Error/ApiError.js').ApiError} When the parameter
 *    is provided more than once.
 */
function parseResponse(value) {
  if (value === undefined) {
    return TEST_DEFAULTS.RESPONSE;
  }

  const rawValue = getSingleValue(value, 'response');

  // Empty response is valid.
  if (rawValue === '') {
    return '';
  }

  // Try to parse JSON.
  try {
    return JSON.parse(rawValue);
  } catch {
    // Not JSON → treat as normal string.
    return rawValue;
  }
}

/**
 * Reads the `response` payload from the request body.
 *
 * Falls back to the default response when the body is absent or does not
 * carry a `response` field. Because the body is already parsed JSON, the value
 * is used as-is — no string re-parsing is required, unlike the query-string
 * variant.
 *
 * @param {*} body - The parsed request body (`req.body`).
 * @returns {*} The response payload (any JSON value, or the default).
 * @throws {import('../../utils/Error/ApiError.js').ApiError} When the body is
 *    present but is not a plain JSON object.
 */
function parseBodyResponse(body) {
  if (body === undefined || body === null) {
    return TEST_DEFAULTS.RESPONSE;
  }

  if (typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(
      'request body must be a JSON object',
      400,
      'INVALID_BODY',
    );
  }

  if (body === undefined) {
    return TEST_DEFAULTS.RESPONSE;
  }

  return body;
}

/**
 * Normalized test options describing a simulated response.
 *
 * @typedef {Object} TestQueryOptions
 * @property {number} delaySeconds - Simulated delay in seconds before responding.
 * @property {number} statusCode - HTTP status code to return to the client.
 * @property {*} response - Response payload (query string, request body, or the default).
 */

/**
 * Validates the test-endpoint query string and returns normalized options.
 *
 * Each documented parameter is optional and falls back to its default value
 * when omitted. The returned object is frozen to prevent accidental mutation.
 *
 * @param {object} query - The raw query string (`req.query`) from the HTTP request.
 * @param {string|string[]} [query.delay] - Raw `delay` parameter, in seconds.
 * @param {string|string[]} [query.statusCode] - Raw `statusCode` parameter.
 * @param {string|string[]} [query.payload] - Raw `payload` parameter.
 * @returns {TestQueryOptions} A frozen, normalized set of test options.
 * @throws {import('../../utils/Error/ApiError.js').ApiError} When any parameter
 *    is invalid or repeated.
 */
export function validateTestQuery(query) {
  const delaySeconds = parseDelay(query.delay);

  const statusCode = parseStatusCode(query.statusCode);

  const response = parseResponse(query.payload);

  return Object.freeze({
    delaySeconds,
    statusCode,
    response,
  });
}

/**
 * Validates a mutating test-endpoint request (`PUT`, `PATCH`, `DELETE`).
 *
 * `delay` and `statusCode` keep the query-string semantics of the GET
 * variants, while `response` is read from the JSON request body so callers can
 * send any JSON value without URL-encoding it. The returned object is frozen
 * to prevent accidental mutation.
 *
 * @param {object} request - The Express request input.
 * @param {object} request.query - The raw query string (`req.query`).
 * @param {*} [request.body] - The parsed request body (`req.body`).
 * @returns {TestQueryOptions} A frozen, normalized set of test options.
 * @throws {import('../../utils/Error/ApiError.js').ApiError} When a query
 *    parameter is invalid or repeated, or the body is not a JSON object.
 */
export function validateTestMutation({ query, body }) {
  const delaySeconds = parseDelay(query.delay);

  const statusCode = parseStatusCode(query.statusCode);

  const response = parseBodyResponse(body);

  return Object.freeze({
    delaySeconds,
    statusCode,
    response,
  });
}
