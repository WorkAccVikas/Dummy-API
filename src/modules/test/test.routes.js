import { Router } from 'express';
import { testController } from './test.controller.js';

/**
 * Express router for the test endpoint.
 *
 * A request to the base path returns a simulated HTTP response configured
 * through the query string (status code, payload and delay).
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

export default router;
