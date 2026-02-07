/**
 * API Documentation Service
 * Swagger/Postman auto-generated docs with interactive testing
 */

class APIDocumentation {
  constructor() {
    this.formats = ['swagger', 'openapi', 'postman', 'redoc'];
    this.versions = ['2.0', '3.0.0', '3.0.1', '3.1.0'];
    this.endpoints = new Map();
  }

  async generateDocs({ format = 'swagger', version = '3.0.0', outputPath = './docs', includeExamples = true }) {
    console.log(`📚 Generating ${format} documentation v${version}`);
    
    const docId = `doc_${Date.now()}`;
    const apiSpec = await this.buildAPISpec(format, version, includeExamples);
    
    const documentation = {
      id: docId,
      format,
      version,
      generatedAt: new Date().toISOString(),
      outputPath,
      spec: apiSpec,
      urls: {
        interactive: `https://api.hootner.com/docs`,
        json: `https://api.hootner.com/docs/swagger.json`,
        yaml: `https://api.hootner.com/docs/swagger.yaml`
      }
    };

    await this.saveDocumentation(documentation, outputPath);
    
    return documentation;
  }

  async buildAPISpec(format, version, includeExamples) {
    const baseSpec = {
      openapi: version,
      info: {
        title: 'HOOTNER API',
        description: 'The Owl Never Sleeps - Video Platform API',
        version: '1.0.0',
        contact: {
          name: 'HOOTNER Support',
          email: 'support@hootner.com',
          url: 'https://hootner.com/support'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        { url: 'https://api.hootner.com/v1', description: 'Production' },
        { url: 'https://staging-api.hootner.com/v1', description: 'Staging' }
      ],
      paths: this.generatePaths(includeExamples),
      components: this.generateComponents(),
      security: [{ bearerAuth: [] }]
    };

    return baseSpec;
  }

  generatePaths(includeExamples) {
    return {
      '/videos': {
        get: {
          summary: 'List videos',
          tags: ['Videos'],
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } }
          ],
          responses: {
            200: {
              description: 'List of videos',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/VideoList' },
                  ...(includeExamples && {
                    example: {
                      videos: [
                        { id: 'v1', title: 'Sample Video', duration: 120 }
                      ],
                      total: 1,
                      limit: 10,
                      offset: 0
                    }
                  })
                }
              }
            }
          }
        },
        post: {
          summary: 'Upload video',
          tags: ['Videos'],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: { $ref: '#/components/schemas/VideoUpload' }
              }
            }
          },
          responses: {
            201: {
              description: 'Video uploaded successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Video' }
                }
              }
            }
          }
        }
      },
      '/videos/{id}': {
        get: {
          summary: 'Get video by ID',
          tags: ['Videos'],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'Video details',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Video' }
                }
              }
            },
            404: { description: 'Video not found' }
          }
        }
      },
      '/users/profile': {
        get: {
          summary: 'Get user profile',
          tags: ['Users'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'User profile',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' }
                }
              }
            }
          }
        }
      }
    };
  }

  generateComponents() {
    return {
      schemas: {
        Video: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'v123' },
            title: { type: 'string', example: 'My Video' },
            description: { type: 'string', example: 'Video description' },
            duration: { type: 'integer', example: 120 },
            url: { type: 'string', format: 'uri' },
            thumbnailUrl: { type: 'string', format: 'uri' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        VideoList: {
          type: 'object',
          properties: {
            videos: { type: 'array', items: { $ref: '#/components/schemas/Video' } },
            total: { type: 'integer' },
            limit: { type: 'integer' },
            offset: { type: 'integer' }
          }
        },
        VideoUpload: {
          type: 'object',
          properties: {
            file: { type: 'string', format: 'binary' },
            title: { type: 'string' },
            description: { type: 'string' }
          },
          required: ['file', 'title']
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'integer' }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    };
  }

  async saveDocumentation(documentation, outputPath) {
    // Mock file saving - replace with actual file operations
    console.log(`💾 Saving documentation to ${outputPath}`);
    return true;
  }

  async generatePostmanCollection() {
    const collection = {
      info: {
        name: 'HOOTNER API',
        description: 'The Owl Never Sleeps - Video Platform API',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      auth: {
        type: 'bearer',
        bearer: [{ key: 'token', value: '{{access_token}}', type: 'string' }]
      },
      item: [
        {
          name: 'Videos',
          item: [
            {
              name: 'List Videos',
              request: {
                method: 'GET',
                header: [],
                url: {
                  raw: '{{base_url}}/videos?limit=10&offset=0',
                  host: ['{{base_url}}'],
                  path: ['videos'],
                  query: [
                    { key: 'limit', value: '10' },
                    { key: 'offset', value: '0' }
                  ]
                }
              }
            },
            {
              name: 'Upload Video',
              request: {
                method: 'POST',
                header: [{ key: 'Content-Type', value: 'multipart/form-data' }],
                body: {
                  mode: 'formdata',
                  formdata: [
                    { key: 'file', type: 'file' },
                    { key: 'title', value: 'Sample Video' },
                    { key: 'description', value: 'Video description' }
                  ]
                },
                url: { raw: '{{base_url}}/videos', host: ['{{base_url}}'], path: ['videos'] }
              }
            }
          ]
        }
      ],
      variable: [
        { key: 'base_url', value: 'https://api.hootner.com/v1' },
        { key: 'access_token', value: 'your-jwt-token' }
      ]
    };

    return collection;
  }

  async generate({ format = 'swagger', version = '3.0.0', outputPath = './docs/api' }) {
    console.log(`📚 Generating ${format} API documentation`);
    
    if (format === 'postman') {
      const collection = await this.generatePostmanCollection();
      return {
        format: 'postman',
        collection,
        generatedAt: new Date().toISOString()
      };
    }
    
    return await this.generateDocs({ format, version, outputPath });
  }
}

module.exports = new APIDocumentation();