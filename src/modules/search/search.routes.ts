import { Router } from 'express';
import { SearchController } from './search.controller.js';

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Discovery and listings (Stays & Move)
 */

const router = Router();

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Unified search for Properties and Drivers
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [stay, move]
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/', SearchController.search);

export default router;
