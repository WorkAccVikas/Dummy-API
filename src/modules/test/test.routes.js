import { Router } from 'express';
import { testByIdController, testController } from './test.controller.js';

/**
 * Express router for the test endpoints.
 *
 * A request to the base path or to a path with an `id` segment returns a
 * simulated HTTP response configured through the query string (status code,
 * payload and delay).
 *
 * @type {import('express').Router}
 */
const router = Router();

/**
 * GET /test
 *
 * Returns the simulated HTTP response described by the query parameters.
 * Parameters are validated by {@link validateTestQuery} and the response is
 * produced by {@link executeTest}.
 *
 * @name getTest
 * @path {GET} /
 * @see testController
 */
router.get('/', testController);

/**
 * GET /test/:id
 *
 * Same simulated-response behaviour as `GET /test`, but the `id` path segment
 * is validated by {@link validateTestId} and echoed back in the response
 * payload.
 *
 * @name getTestById
 * @path {GET} /:id
 * @see testByIdController
 */
router.get('/:id', testByIdController);

export default router;
