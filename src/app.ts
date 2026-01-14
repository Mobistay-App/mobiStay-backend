import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import stayRoutes from './modules/stays/stay.routes.js';
import driverRoutes from './modules/driver/driver.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
import searchRoutes from './modules/search/search.routes.js';
import rideRoutes from './modules/rides/ride.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import { setupSwagger } from './config/swagger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Static Files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Documentation
setupSwagger(app);

// Base Route
app.get('/', (req, res) => {
    res.send({ status: 'ok', message: 'Mobistay Backend is running 🚀', documentation: '/docs' });
});

// Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', stayRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);

export default app;