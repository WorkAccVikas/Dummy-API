import { delay } from '../../utils/delay.js';
import { secondsToMilliseconds } from '../../utils/time.js';

/**
 * Result of a single simulated test execution.
 *
 * @typedef {Object} TestExecutionResult
 * @property {number} statusCode - HTTP status code to send to the client.
 * @property {*} response - Response payload to send to the client.
 * @property {number} delaySeconds - Simulated latency in seconds.
 */

/**
 * Executes a simulated test response.
 *
 * Waits for the configured delay, converting the seconds-based API value to
 * the milliseconds-based contract of the low-level `delay` primitive, unless
 * the supplied `AbortSignal` is triggered — in which case the delay is
 * cancelled and the returned promise rejects with an `AbortError`.
 *
 * The service acts as the boundary between the seconds-based API contract and
 * the milliseconds-based delay utility. It depends only on narrow,
 * well-defined primitives (dependency inversion) and owns no parsing or
 * HTTP concerns (single responsibility).
 *
 * @async
 * @function executeTest
 * @param {object} options - Execution options.
 * @param {number} options.delaySeconds - Time to wait before responding, in seconds.
 * @param {number} options.statusCode - HTTP status code to include in the result.
 * @param {*} options.response - Response payload to include in the result.
 * @param {AbortSignal} [options.signal] - Signal used to cancel the delay on client disconnect.
 * @returns {Promise<TestExecutionResult>} A promise resolving to a frozen execution result.
 * @throws {DOMException} When the delay is cancelled via `signal` (name `AbortError`).
 */
export async function executeTest({
  delaySeconds,
  statusCode,
  response,
  signal,
}) {
  await delay(secondsToMilliseconds(delaySeconds), {
    signal,
  });

  return Object.freeze({
    statusCode,
    response,
    delaySeconds,
  });
}
