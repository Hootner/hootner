// Swagger/OpenAPI Configuration
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HOOTNER API',
      version: '1.0.0',
      description: 'Enterprise Video Streaming Platform API',
      contact: {
        name: 'HOOTNER Support',
        email: 'support@hootner.com',
        url: 'https://hootner.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:4000',
        description: 'Development server'
      },
      {
        url: 'https://api.hootner.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./api/**/*.js', './routes/**/*.js'] // Path to API docs
};

export const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }'
  }));
  
  // Serve spec as JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('✅ Swagger documentation available at /api-docs');
};

export default { swaggerSpec, setupSwagger };
