import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRoutes from './modules/auth/auth.routes.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Base Route
app.get('/', (req, res) => {
    res.send({ status: 'ok', message: 'Mobistay Backend is running 🚀' });
});

// Module Routes
app.use('/api/auth', authRoutes);

export default app;