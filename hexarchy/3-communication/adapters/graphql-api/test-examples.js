/**
 * GraphQL API Test Examples
 * Demonstrates queries, mutations, and subscriptions
 *
 * Run with: node test-examples.js
 */

const { GraphQLClient, gql } = require('graphql-request');
const { createClient } = require('graphql-ws');
const WebSocket = require('ws');

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';
const WS_ENDPOINT = 'ws://localhost:4000/graphql';

// HTTP Client
const client = new GraphQLClient(GRAPHQL_ENDPOINT);

// ==================== QUERIES ====================

async function testHealthCheck() {
    console.log('\n🔍 Testing Health Check...');

    const query = gql`
    query {
      health {
        status
        timestamp
        uptime
        services {
          graphql
          database
          redis
          videoGeneration
          streaming
        }
      }
      version
    }
  `;

    try {
        const data = await client.request(query);
        console.log('✅ Health Check:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function testAnalytics() {
    console.log('\n📊 Testing Analytics...');

    const query = gql`
    query {
      analytics {
        totalUsers
        totalVideos
        totalStreams
        activeStreams
        revenue
        timestamp
      }
    }
  `;

    try {
        const data = await client.request(query);
        console.log('✅ Analytics:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// ==================== MUTATIONS ====================

async function testVideoGeneration() {
    console.log('\n🎬 Testing Video Generation...');

    const mutation = gql`
    mutation GenerateVideo($input: GenerateVideoInput!) {
      generateVideo(input: $input) {
        success
        message
        job {
          id
          prompt
          status
          progress
          estimatedTime
          config {
            numFrames
            height
            width
            fps
            guidanceScale
          }
        }
        errors {
          field
          message
        }
      }
    }
  `;

    const variables = {
        input: {
            prompt: 'A robot dancing in space',
            numFrames: 16,
            height: 64,
            width: 64,
            fps: 8,
            guidanceScale: 7.5,
        },
    };

    try {
        const data = await client.request(mutation, variables);
        console.log('✅ Generation Started:', JSON.stringify(data, null, 2));
        return data.generateVideo.job?.id;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

async function testStreamStart() {
    console.log('\n📡 Testing Stream Start...');

    const mutation = gql`
    mutation StartStream($input: StartStreamInput!) {
      startStream(input: $input) {
        success
        message
        stream {
          id
          title
          status
          streamUrl
          playbackUrl
          viewers
          resolution
          bitrate
          fps
        }
      }
    }
  `;

    const variables = {
        input: {
            title: 'Test Live Stream',
            description: 'Testing GraphQL subscriptions',
            resolution: '1920x1080',
            bitrate: 5000,
            fps: 30,
        },
    };

    try {
        const data = await client.request(mutation, variables);
        console.log('✅ Stream Started:', JSON.stringify(data, null, 2));
        return data.startStream.stream?.id;
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// ==================== SUBSCRIPTIONS ====================

async function testGenerationProgressSubscription(jobId) {
    console.log(`\n🔔 Subscribing to Generation Progress (Job: ${jobId})...`);

    const wsClient = createClient({
        url: WS_ENDPOINT,
        webSocketImpl: WebSocket,
    });

    const subscription = gql`
    subscription GenerationProgress($jobId: ID!) {
      generationProgress(jobId: $jobId) {
        jobId
        progress
        status
        message
        estimatedTimeRemaining
        timestamp
      }
    }
  `;

    return new Promise((resolve) => {
        const cleanup = () => {
            if (timeoutId) clearTimeout(timeoutId);
            wsClient.dispose();
        };

        let timeoutId;

        const unsubscribe = wsClient.subscribe(
            {
                query: subscription,
                variables: { jobId },
            },
            {
                next: (data) => {
                    console.log('📨 Progress Update:', JSON.stringify(data.data, null, 2));

                    if (data.data.generationProgress.progress >= 100) {
                        console.log('✅ Generation Complete!');
                        unsubscribe();
                        cleanup();
                        resolve();
                    }
                },
                error: (error) => {
                    console.error('❌ Subscription Error:', error);
                    unsubscribe();
                    cleanup();
                    resolve();
                },
                complete: () => {
                    console.log('✅ Subscription Completed');
                    cleanup();
                    resolve();
                },
            }
        );

        timeoutId = setTimeout(() => {
            console.log('⏱️  Timeout reached, unsubscribing...');
            unsubscribe();
            cleanup();
            resolve();
        }, 60000);
    });
}

async function testStreamViewersSubscription(streamId) {
    console.log(`\n🔔 Subscribing to Stream Viewers (Stream: ${streamId})...`);

    const wsClient = createClient({
        url: WS_ENDPOINT,
        webSocketImpl: WebSocket,
    });

    const subscription = gql`
    subscription StreamViewers($streamId: ID!) {
      streamViewers(streamId: $streamId) {
        streamId
        viewers
        timestamp
      }
    }
  `;

    return new Promise((resolve) => {
        let updateCount = 0;
        const cleanup = () => {
            if (timeoutId) clearTimeout(timeoutId);
            wsClient.dispose();
        };

        let timeoutId;

        const unsubscribe = wsClient.subscribe(
            {
                query: subscription,
                variables: { streamId },
            },
            {
                next: (data) => {
                    console.log('👥 Viewers Update:', JSON.stringify(data.data, null, 2));
                    updateCount++;

                    if (updateCount >= 5) {
                        console.log('✅ Received 5 updates, unsubscribing...');
                        unsubscribe();
                        cleanup();
                        resolve();
                    }
                },
                error: (error) => {
                    console.error('❌ Subscription Error:', error);
                    unsubscribe();
                    cleanup();
                    resolve();
                },
                complete: () => {
                    console.log('✅ Subscription Completed');
                    cleanup();
                    resolve();
                },
            }
        );

        timeoutId = setTimeout(() => {
            console.log('⏱️  Timeout reached, unsubscribing...');
            unsubscribe();
            cleanup();
            resolve();
        }, 30000);
    });
}

// ==================== RUN TESTS ====================

async function runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 HOOTNER GraphQL API Tests');
    console.log('='.repeat(60));

    try {
        // Test Queries
        await testHealthCheck();
        await testAnalytics();

        // Test Mutations & Subscriptions
        // Note: These require the video generation service to be running
        // const jobId = await testVideoGeneration();
        // if (jobId) {
        //   await testGenerationProgressSubscription(jobId);
        // }

        // const streamId = await testStreamStart();
        // if (streamId) {
        //   await testStreamViewersSubscription(streamId);
        // }

        console.log('\n' + '='.repeat(60));
        console.log('✅ All Tests Completed');
        console.log('='.repeat(60) + '\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Test Suite Failed:', error);
        process.exit(1);
    }
}

// Check if server is running
async function checkServer() {
    try {
        const response = await fetch('http://localhost:4000/health');
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Main
(async () => {
    const serverRunning = await checkServer();

    if (!serverRunning) {
        console.error('❌ GraphQL server is not running!');
        console.log('💡 Start the server with: npm run dev');
        process.exit(1);
    }

    await runAllTests();
})();
