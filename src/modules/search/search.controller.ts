import { Request, Response } from 'express';
import { z } from 'zod';
import { SearchService } from './search.service.js';
import { SearchQuerySchema } from './search.schema.js';

export class SearchController {
    /**
     * Unified Search Endpoint
     */
    static async search(req: Request, res: Response): Promise<void> {
        try {
            // Validation: Parse query params
            const validatedQuery = SearchQuerySchema.parse(req.query);

            const results = await SearchService.search(validatedQuery);

            res.status(200).json({
                success: true,
                message: 'Search completed successfully',
                data: results,
            });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ success: false, errors: error.issues });
                return;
            }
            res.status(400).json({ success: false, message: error.message });
        }
    }
}
