import { ApiError } from '../../utils/Error/ApiError.js';
import { TEST_ID_LIMITS, TEST_ID_PATTERN } from './test.constants.js';

/**
 * Validates the `id` path parameter of the `/test/:id` endpoint.
 *
 * Returns the identifier unchanged so it can be echoed back in the response.
 * The identifier must be a URL-safe token (letters, digits, dashes or
 * underscores) within the documented length limits.
 *
 * @param {string|string[]} id - Raw `id` from `req.params.id`.
 * @returns {string} The validated identifier.
 * @throws {import('../../utils/Error/ApiError.js').ApiError} When `id` is not
 *    a URL-safe token of the allowed length.
 */
export function validateTestId(id) {
  if (typeof id !== 'string' || !TEST_ID_PATTERN.test(id)) {
    throw new ApiError(
      'id must contain only letters, digits, dashes or underscores',
      400,
      'INVALID_ID',
    );
  }

  if (
    id.length < TEST_ID_LIMITS.MIN_LENGTH ||
    id.length > TEST_ID_LIMITS.MAX_LENGTH
  ) {
    throw new ApiError(
      `id must be between ${TEST_ID_LIMITS.MIN_LENGTH} and ${TEST_ID_LIMITS.MAX_LENGTH} characters`,
      400,
      'INVALID_ID',
    );
  }

  return id;
}