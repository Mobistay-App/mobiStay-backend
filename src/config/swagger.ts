import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { env } from './env.js';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Mobistay API Documentation',
            version: '1.0.0',
            description: 'API documentation for Mobistay backend services including Auth, Stay, and Move modules.',
        },
        servers: [
            {
                url: env.NODE_ENV === 'production'
                    ? 'https://mobistay-backend.onrender.com'
                    : `http://localhost:${env.PORT || 5000}`,
                description: env.NODE_ENV === 'production' ? 'Production server' : 'Local development server',
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'mobistay_token',
                },
            },
        },
    },
    apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.schema.ts'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customSiteTitle: 'Mobistay API Docs',
    }));

    console.log(`📝 Swagger docs available at /docs`);
};
