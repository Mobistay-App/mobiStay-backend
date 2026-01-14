import { Router, Request, Response } from 'express';
import { upload } from '../../services/storage.service.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Upload]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file uploaded or invalid file type
 */
router.post('/', authenticate, upload.single('file'), (req: Request, res: Response) => {
    console.log('Upload request headers:', req.headers);
    console.log('Upload request file:', req.file);
    console.log('Upload request body:', req.body);

    try {
        if (!req.file) {
            console.error('Multer failed to catch the file. Check field names and Content-Type.');
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }

        // Construct the file URL
        // In a real production app, this would be a cloud URL
        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                url: fileUrl,
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size
            }
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router;
