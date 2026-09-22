/**
 * Converts a duration expressed in seconds to its equivalent in milliseconds.
 *
 * This is the single place where the seconds-based API contract is translated
 * into the milliseconds-based contract of the low-level `delay` primitive
 * (single responsibility principle).
 *
 * @param {number} seconds - Duration in seconds (non-negative, may be fractional).
 * @returns {number} The equivalent duration in milliseconds.
 */
export function secondsToMilliseconds(seconds) {
  return seconds * 1000;
}