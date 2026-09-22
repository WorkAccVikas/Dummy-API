import { delay } from '../../utils/delay.js';

/**
 * Result of a single simulated test execution.
 *
 * @typedef {Object} TestExecutionResult
 * @property {number} statusCode - HTTP status code to send to the client.
 * @property {*} response - Response payload to send to the client.
 * @property {number} delayMs - Simulated latency in milliseconds.
 */

/**
 * Executes a simulated test response.
 *
 * Waits for the configured delay before resolving, unless the supplied
 * `AbortSignal` is triggered, in which case the delay is cancelled and the
 * returned promise rejects with an `AbortError`.
 *
 * @async
 * @function executeTest
 * @param {object} options - Execution options.
 * @param {number} options.delayMs - Time to wait before responding, in milliseconds.
 * @param {number} options.statusCode - HTTP status code to include in the result.
 * @param {*} options.response - Response payload to include in the result.
 * @param {AbortSignal} [options.signal] - Signal used to cancel the delay on client disconnect.
 * @returns {Promise<TestExecutionResult>} A promise resolving to a frozen execution result.
 * @throws {DOMException} When the delay is cancelled via `signal` (name `AbortError`).
 */
export async function executeTest({ delayMs, statusCode, response, signal }) {
  await delay(delayMs, {
    signal,
  });

  return Object.freeze({
    statusCode,
    response,
    delayMs,
  });
}
