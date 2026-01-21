import { Router } from 'express';
import { PaymentController } from './payment.controller.js';

const router = Router();

// Callback endpoint for redirect (GET)
router.get('/callback', PaymentController.handleCallback);

// Webhook endpoint (POST)
router.post('/webhook', PaymentController.handleWebhook);

export default router;
