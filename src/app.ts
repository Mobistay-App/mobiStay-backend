import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRoutes from './modules/auth/auth.routes.js';
import { setupSwagger } from './config/swagger.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Documentation
setupSwagger(app);

// Base Route
app.get('/', (req, res) => {
    res.send({ status: 'ok', message: 'Mobistay Backend is running 🚀', documentation: '/docs' });
});

// Module Routes
app.use('/api/auth', authRoutes);


export default app;