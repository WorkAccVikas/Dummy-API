import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/Response/ApiResponse.js';
import { validateTestQuery } from './test-query.validator.js';
import { executeTest } from './test.service.js';

/**
 * Handles a request to the test endpoint.
 *
 * Validates the query string, delegates the simulated response to
 * `executeTest`, and writes the result to the client. When the execution
 * resolves with a 204 status, an empty body is sent instead of JSON.
 *
 * @async
 * @function
 * @param {import('express').Request} req - The incoming Express request.
 *    `req.query` is validated by {@link validateTestQuery} and
 *    `req.abortSignal` is forwarded to the service so the simulated delay is
 *    cancelled if the client disconnects.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>} Resolves once the response has been sent.
 */
async function testController1(req, res) {
  const input = validateTestQuery(req.query);

  const result = await executeTest({
    ...input,
    signal: req.abortSignal,
  });

  if (result.statusCode === 204) {
    return res.status(204).end();
  }

  const data = {
    success: result.statusCode < 400,

    statusCode: result.statusCode,

    message: result.response,

    delay: result.delayMs,
  };
  return res
    .status(result.statusCode)
    .json(new ApiResponse(result.statusCode, data));
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

export { testController };
