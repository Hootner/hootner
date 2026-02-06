const { CognitoJwtVerifier } = require('aws-jwt-verify');
const AWS = require('aws-sdk');
const crypto = require('crypto');

// Initialize AWS clients
const batch = new AWS.Batch();
const s3 = new AWS.S3();

// Initialize Cognito JWT Verifier
const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.USER_POOL_ID,
    clientId: process.env.USER_POOL_CLIENT_ID,
    tokenUse: 'access'
});

/**
 * AWS Lambda function to submit HOOTNER render jobs to Batch
 * ✅ FULL AUTHENTICATION REQUIRED - No render jobs without valid login
 */
exports.handler = async (event, context) => {
    console.log('🔐 Authenticated Batch render trigger');

    try {
        // 🔒 STEP 1: VERIFY AUTHENTICATION (REQUIRED)
        const authResult = await verifyAuthentication(event);
        if (!authResult.success) {
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    success: false,
                    error: 'Authentication required',
                    message: authResult.message,
                    loginRequired: true
                })
            };
        }

        const { userId, email, username } = authResult;
        console.log(`✅ Authenticated user: ${userId} (${email})`);

        // Parse trigger event
        const triggerType = event.source || 'api';
        const bucket = event.bucket || process.env.S3_BUCKET || 'hootner-frontend-504165876439';

        // Generate unique job name with user context
        const jobName = `hootner-render-${userId.substring(0,8)}-${crypto.randomBytes(4).toString('hex')}-${Date.now()}`;

        // Check if prompts file exists
        try {
            const s3Response = await s3.headObject({
                Bucket: bucket,
                Key: 'training_prompts.json'
            }).promise();

            console.log(`✅ Found training prompts: ${s3Response.ContentLength} bytes`);
        } catch (s3Error) {
            if (s3Error.code === 'NotFound') {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        success: false,
                        error: 'Training prompts not found',
                        message: 'Upload training_prompts.json to S3 first'
                    })
                };
            }
            throw s3Error;
        }

        // 🚀 STEP 2: SUBMIT AUTHENTICATED BATCH JOB
        const batchResponse = await batch.submitJob({
            jobName: jobName,
            jobQueue: process.env.BATCH_JOB_QUEUE || 'hootner-render-queue',
            jobDefinition: process.env.BATCH_JOB_DEFINITION || 'hootner-gpu-render-job',
            parameters: {
                S3_BUCKET: bucket,
                TRIGGER_TYPE: triggerType,
                USER_ID: userId,
                USER_EMAIL: email,
                USER_NAME: username,
                TIMESTAMP: new Date().toISOString()
            },
            containerOverrides: {
                environment: [
                    { name: 'JOB_NAME', value: jobName },
                    { name: 'USER_ID', value: userId },
                    { name: 'USER_EMAIL', value: email },
                    { name: 'USER_NAME', value: username },
                    { name: 'TRIGGER_EVENT', value: JSON.stringify(event) },
                    { name: 'AUTHENTICATED', value: 'true' }
                ]
            },
            retryStrategy: { attempts: 2 },
            timeout: { attemptDurationSeconds: 7200 },
            tags: {
                JobName: jobName,
                UserId: userId,
                UserEmail: email,
                TriggerType: triggerType,
                Timestamp: new Date().toISOString(),
                Authenticated: 'true',
                Project: 'HOOTNER'
            }
        }).promise();

        const jobId = batchResponse.jobId;

        console.log(`🚀 Submitted authenticated batch job: ${jobName} (ID: ${jobId}) for user: ${userId}`);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                jobName: jobName,
                jobId: jobId,
                userId: userId,
                userEmail: email,
                message: 'Authenticated render job submitted successfully',
                timestamp: new Date().toISOString(),
                details: {
                    jobQueue: process.env.BATCH_JOB_QUEUE,
                    jobDefinition: process.env.BATCH_JOB_DEFINITION,
                    bucket: bucket,
                    triggerType: triggerType,
                    authenticatedUser: email
                }
            })
        };

    } catch (error) {
        console.error('❌ Batch job submission error:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: error.message,
                message: 'Internal server error'
            })
        };
    }
};

/**
 * 🔐 VERIFY AUTHENTICATION TOKEN (REQUIRED FOR ALL REQUESTS)
 */
async function verifyAuthentication(event) {
    try {
        // Extract token from different possible sources
        let token = null;

        // 1. Authorization header (API Gateway standard)
        if (event.headers && event.headers.Authorization) {
            const authHeader = event.headers.Authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        // 2. Lowercase authorization header (API Gateway sometimes lowercases)
        if (!token && event.headers && event.headers.authorization) {
            const authHeader = event.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        // 3. Query parameter (for testing/debugging)
        if (!token && event.queryStringParameters && event.queryStringParameters.token) {
            token = event.queryStringParameters.token;
        }

        // 4. Request body (for POST requests)
        if (!token && event.body) {
            try {
                const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
                if (body.token || body.accessToken) {
                    token = body.token || body.accessToken;
                }
            } catch (e) {
                // Ignore JSON parse errors
            }
        }

        if (!token) {
            return {
                success: false,
                message: 'No authentication token provided. Please log in and include Bearer token in Authorization header.'
            };
        }

        // Verify the JWT token with Cognito
        const payload = await verifier.verify(token);

        return {
            success: true,
            userId: payload.sub,
            email: payload.email || payload.username,
            username: payload['cognito:username'] || payload.username,
            tokenPayload: payload
        };

    } catch (error) {
        console.error('🔐 Authentication verification failed:', error);

        return {
            success: false,
            message: `Invalid or expired authentication token: ${error.message}`
        };
    }
}

/**
 * 📊 Get authenticated user's job status (users can only see their own jobs)
 */
exports.getJobStatus = async (event, context) => {
    try {
        // 🔒 VERIFY AUTHENTICATION FIRST
        const authResult = await verifyAuthentication(event);
        if (!authResult.success) {
            return {
                statusCode: 401,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    error: 'Authentication required',
                    loginRequired: true
                })
            };
        }

        const { userId } = authResult;
        const jobId = event.pathParameters?.jobId;

        if (!jobId) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    error: 'Job ID required'
                })
            };
        }

        const response = await batch.describeJobs({ jobs: [jobId] }).promise();

        if (response.jobs.length === 0) {
            return {
                statusCode: 404,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    error: 'Job not found'
                })
            };
        }

        const job = response.jobs[0];

        // 🔒 USER ISOLATION: Users can only see their own jobs
        const jobUserId = job.tags?.UserId;
        if (jobUserId !== userId) {
            return {
                statusCode: 403,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    success: false,
                    error: 'Access denied - you can only view your own render jobs'
                })
            };
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: true,
                job: {
                    jobId: job.jobId,
                    jobName: job.jobName,
                    status: job.status,
                    createdAt: job.createdAt,
                    startedAt: job.startedAt,
                    stoppedAt: job.stoppedAt,
                    statusReason: job.statusReason,
                    userId: jobUserId,
                    userEmail: job.tags?.UserEmail
                }
            })
        };

    } catch (error) {
        console.error('❌ Get job status error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};
