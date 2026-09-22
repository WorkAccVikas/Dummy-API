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
 * Creates an Express handler for the id-based test endpoints (`/test/:id`).
 *
 * The returned handler validates the `id` path segment via
 * {@link validateTestId}, validates the query string via
 * {@link validateTestQuery}, executes the simulated response through
 * {@link executeTest}, and echoes `id` back in the response payload. When a
 * `method` is supplied it is echoed too, which is what distinguishes the
 * mutating verbs (PUT, PATCH, DELETE) from the GET variant.
 *
 * The returned handler must still be wrapped with {@link asyncHandler} so
 * rejected promises — validation failures or aborted requests — reach the
 * Express error-handling middleware.
 *
 * @function makeTestByIdHandler
 * @param {string} [method] - HTTP method to echo in the response payload.
 *    Omit it for endpoints that should not reflect a method (e.g. GET).
 * @returns {function(
 *    req: import('express').Request,
 *    res: import('express').Response,
 *  ): Promise<import('express').Response>} The id-based request handler.
 */
function makeTestByIdHandler(method) {
  return async function handleTestById(req, res) {
    const id = validateTestId(req.params.id);

    const input = validateTestQuery(req.query);

    const result = await executeTest({
      ...input,
      signal: req.abortSignal,
    });

    return sendTestResult(res, result, {
      id,
      ...(method ? { method } : {}),
    });
  };
}

/**
 * Express request handler for `GET /test/:id`.
 *
 * Validates and echoes `id` in the response payload.
 *
 * @type {import('express').RequestHandler}
 */
const testByIdController = asyncHandler(makeTestByIdHandler());

/**
 * Express request handler for `PUT /test/:id`.
 *
 * Same behavior as the GET variant, but also echoes `PUT` in the response
 * payload.
 *
 * @type {import('express').RequestHandler}
 */
const putTestByIdController = asyncHandler(makeTestByIdHandler('PUT'));

/**
 * Express request handler for `PATCH /test/:id`.
 *
 * Same behavior as the GET variant, but also echoes `PATCH` in the response
 * payload.
 *
 * @type {import('express').RequestHandler}
 */
const patchTestByIdController = asyncHandler(makeTestByIdHandler('PATCH'));

/**
 * Express request handler for `DELETE /test/:id`.
 *
 * Same behavior as the GET variant, but also echoes `DELETE` in the response
 * payload.
 *
 * @type {import('express').RequestHandler}
 */
const deleteTestByIdController = asyncHandler(makeTestByIdHandler('DELETE'));

export {
  deleteTestByIdController,
  patchTestByIdController,
  putTestByIdController,
  testByIdController,
  testController,
};
