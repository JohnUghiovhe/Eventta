import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health status
 *     tags: [Health]
 *     description: Returns the overall health status of the API including server uptime, database connection, and email service configuration.
 *     responses:
 *       200:
 *         description: Health check successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Eventta API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                 environment:
 *                   type: string
 *                   example: development
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [connected, disconnected, connecting, disconnecting]
 *                         connected:
 *                           type: boolean
 *                     email:
 *                       type: object
 *                       properties:
 *                         configured:
 *                           type: boolean
 *                         errors:
 *                           type: array
 *                           items:
 *                             type: string
 */
router.get('/health', HealthController.getHealth);

/**
 * @swagger
 * /api/health/email:
 *   get:
 *     summary: Check email service connectivity
 *     tags: [Health]
 *     description: Verifies the email service configuration and performs a live SMTP connection test.
 *     responses:
 *       200:
 *         description: Email health check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                   enum: [healthy, unhealthy, misconfigured, error]
 *                 message:
 *                   type: string
 *                 config:
 *                   type: object
 *                   properties:
 *                     host:
 *                       type: string
 *                     port:
 *                       type: integer
 *                     userSet:
 *                       type: boolean
 *                     passwordSet:
 *                       type: boolean
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                 error:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/health/email', HealthController.getEmailHealth);

export default router;
