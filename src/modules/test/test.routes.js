import { Router } from 'express';
import {
  deleteTestByIdController,
  patchTestByIdController,
  putTestByIdController,
  testByIdController,
  testController,
} from './test.controller.js';

/**
 * Express router for the test endpoints.
 *
 * Handles simulated HTTP responses configured through the query string
 * (status code, payload and delay). The base path and the `:id` path accept
 * GET; the `:id` path additionally accepts PUT, PATCH and DELETE, which echo
 * the request method in the response payload.
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

/**
 * PUT /test/:id
 *
 * Same simulated-response behaviour as `GET /test/:id`, but the response
 * payload also reflects the request method (`PUT`).
 *
 * @name putTestById
 * @path {PUT} /:id
 * @see putTestByIdController
 */
router.put('/:id', putTestByIdController);

/**
 * PATCH /test/:id
 *
 * Same simulated-response behaviour as `GET /test/:id`, but the response
 * payload also reflects the request method (`PATCH`).
 *
 * @name patchTestById
 * @path {PATCH} /:id
 * @see patchTestByIdController
 */
router.patch('/:id', patchTestByIdController);

/**
 * DELETE /test/:id
 *
 * Same simulated-response behaviour as `GET /test/:id`, but the response
 * payload also reflects the request method (`DELETE`).
 *
 * @name deleteTestById
 * @path {DELETE} /:id
 * @see deleteTestByIdController
 */
router.delete('/:id', deleteTestByIdController);

export default router;
