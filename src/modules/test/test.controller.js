import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/Response/ApiResponse.js';
import {
  validateTestMutation,
  validateTestQuery,
} from './test-query.validator.js';
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
      response: result.response,
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
 * {@link validateTestId}, normalizes the request through the supplied
 * `validateRequest` function, executes the simulated response through
 * {@link executeTest}, and echoes `id` back in the response payload. When a
 * `method` is supplied it is echoed too, distinguishing the mutating verbs
 * (PUT, PATCH, DELETE) from the GET variant.
 *
 * The returned handler must still be wrapped with {@link asyncHandler} so
 * rejected promises — validation failures or aborted requests — reach the
 * Express error-handling middleware.
 *
 * @function makeTestByIdHandler
 * @param {object} options - Handler options.
 * @param {string} [options.method] - HTTP method to echo in the response payload.
 *    Omit it for endpoints that should not reflect a method (e.g. GET).
 * @param {function(import('express').Request): import('./test-query.validator.js').TestQueryOptions}
 *    options.validateRequest - Normalizes the request into test options
 *    (query-only for GET, query + body for mutations).
 * @returns {function(
 *    req: import('express').Request,
 *    res: import('express').Response,
 *  ): Promise<import('express').Response>} The id-based request handler.
 */
function makeTestByIdHandler({ method, validateRequest }) {
  return async function handleTestById(req, res) {
    const id = validateTestId(req.params.id);

    const input = validateRequest(req);
    console.log(`🚀 ~ handleTestById ~ input:`, input);

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
 * Reads every option (`delay`, `statusCode`, `response`) from the query
 * string and echoes `id` in the response payload.
 *
 * @type {import('express').RequestHandler}
 */
const testByIdController = asyncHandler(
  makeTestByIdHandler({
    validateRequest: (req) => validateTestQuery(req.query),
  }),
);

/**
 * Express request handler for `PUT /test/:id`.
 *
 * Reads `delay` and `statusCode` from the query string and `response` from the
 * JSON request body; echoes `id` and `PUT` in the response payload.
 *
 * @type {import('express').RequestHandler}
 */
const putTestByIdController = asyncHandler(
  makeTestByIdHandler({
    method: 'PUT',
    validateRequest: validateTestMutation,
  }),
);

/**
 * Express request handler for `PATCH /test/:id`.
 *
 * Reads `delay` and `statusCode` from the query string and `response` from the
 * JSON request body; echoes `id` and `PATCH` in the response payload.
 *
 * @type {import('express').RequestHandler}
 */
const patchTestByIdController = asyncHandler(
  makeTestByIdHandler({
    method: 'PATCH',
    validateRequest: validateTestMutation,
  }),
);

/**
 * Express request handler for `DELETE /test/:id`.
 *
 * Reads `delay` and `statusCode` from the query string and `response` from the
 * JSON request body; echoes `id` and `DELETE` in the response payload.
 *
 * @type {import('express').RequestHandler}
 */
const deleteTestByIdController = asyncHandler(
  makeTestByIdHandler({
    method: 'DELETE',
    validateRequest: validateTestMutation,
  }),
);

export {
  deleteTestByIdController,
  patchTestByIdController,
  putTestByIdController,
  testByIdController,
  testController,
};
