import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/Response/ApiResponse.js';
import { validateTestQuery } from './test-query.validator.js';
import { validateTestId } from './test-id.validator.js';
import { executeTest } from './test.service.js';

/**
 * Sends the result of a test execution to the client.
 *
 * A 204 status is honored by responding with an empty body; every other
 * status is wrapped in the standard {@link ApiResponse} envelope. Optional
 * extra fields (e.g. the echoed `id` on the `/test/:id` endpoint) are merged
 * into the payload.
 *
 * @function sendTestResult
 * @param {import('express').Response} res - The Express response object.
 * @param {import('./test.service.js').TestExecutionResult} result - Result of the execution.
 * @param {object} [extra] - Additional fields to merge into the response payload.
 * @returns {import('express').Response} The response object, for chaining.
 */
function sendTestResult(res, result, extra = {}) {
  if (result.statusCode === 204) {
    return res.status(204).end();
  }

  return res.status(result.statusCode).json(
    new ApiResponse(result.statusCode, {
      ...extra,
      success: result.statusCode < 400,
      statusCode: result.statusCode,
      message: result.response,
      delay: result.delaySeconds,
    }),
  );
}

/**
 * Handles a request to the test endpoint.
 *
 * Validates the query string, delegates the simulated response to
 * `executeTest`, and writes the result to the client via {@link sendTestResult}.
 *
 * @async
 * @function
 * @param {import('express').Request} req - The incoming Express request.
 *    `req.query` is validated by {@link validateTestQuery} and
 *    `req.abortSignal` is forwarded to the service so the simulated delay is
 *    cancelled if the client disconnects.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<import('express').Response>} Resolves once the response has been sent.
 */
async function testController1(req, res) {
  const input = validateTestQuery(req.query);

  const result = await executeTest({
    ...input,
    signal: req.abortSignal,
  });

  return sendTestResult(res, result);
}

/**
 * Express request handler for the test endpoint.
 *
 * Wrapped with {@link asyncHandler} so rejected promises — validation
 * failures or aborted requests — are forwarded to the Express error-handling
 * middleware automatically.
 *
 * @type {import('express').RequestHandler}
 */
const testController = asyncHandler(testController1);

/**
 * Handles a request to the `test/:id` endpoint.
 *
 * Behaves exactly like the base test endpoint — the query string is validated
 * by {@link validateTestQuery} and the simulated response is produced by
 * {@link executeTest} — but the `id` path segment is also validated by
 * {@link validateTestId} and echoed back in the response payload.
 *
 * @async
 * @function
 * @param {import('express').Request} req - The incoming Express request.
 *    `req.params.id` is validated by {@link validateTestId}; `req.query` is
 *    validated by {@link validateTestQuery}; `req.abortSignal` is forwarded to
 *    the service so the simulated delay is cancelled if the client disconnects.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<import('express').Response>} Resolves once the response has been sent.
 */
async function testByIdController1(req, res) {
  const id = validateTestId(req.params.id);

  const input = validateTestQuery(req.query);

  const result = await executeTest({
    ...input,
    signal: req.abortSignal,
  });

  return sendTestResult(res, result, { id });
}

/**
 * Express request handler for the `test/:id` endpoint.
 *
 * Wrapped with {@link asyncHandler} so rejected promises — validation
 * failures or aborted requests — are forwarded to the Express error-handling
 * middleware automatically.
 *
 * @type {import('express').RequestHandler}
 */
const testByIdController = asyncHandler(testByIdController1);

export { testByIdController, testController };
