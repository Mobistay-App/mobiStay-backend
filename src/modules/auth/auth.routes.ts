import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { rateLimit } from '../../middleware/ratelimit.middleware.js';
import { otpRateLimiter, loginRateLimiter, registerRateLimiter } from '../../shared/ratelimit.js';


const router = Router();

// Define Routes
router.post('/register', rateLimit(registerRateLimiter), AuthController.register);
router.post('/login', rateLimit(loginRateLimiter), AuthController.login);
router.post('/verify', AuthController.verify);
router.post('/resend-otp', rateLimit(otpRateLimiter), AuthController.resendOtp);

export default router;
