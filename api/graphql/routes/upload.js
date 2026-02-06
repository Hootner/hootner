/**
 * Video Upload Routes
 * Handles presigned URL generation and upload completion
 */

const express = require('express');
const router = express.Router();
const { generateUploadURL, validateUpload } = require('../../../services/s3-upload-service');
const { sendProcessingJob } = require('../../../services/sqs-video-processor');
const { createVideo } = require('../resolvers/dynamodb-helpers');
const { getUserFromRequest } = require('../utils/auth');

/**
 * POST /api/upload/presign
 * Generate presigned URL for video upload
 */
router.post('/presign', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { filename, contentType, fileSize } = req.body;

    if (!filename || !contentType || !fileSize) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate upload
    try {
      validateUpload(filename, fileSize, contentType);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    // Generate presigned URL
    const result = await generateUploadURL(user.id, filename, contentType);

    res.json({
      success: true,
      ...result,
      uploadId: result.fileKey.split('/').pop().split('-')[0]
    });

  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

/**
 * POST /api/upload/complete
 * Mark upload as complete and trigger processing
 */
router.post('/complete', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { fileKey, title, description, visibility = 'private' } = req.body;

    if (!fileKey || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create video record
    const video = await createVideo({
      userId: user.id,
      title,
      description,
      visibility,
      sourceKey: fileKey,
      status: 'processing'
    });

    // Send to processing queue
    await sendProcessingJob({
      type: 'transcode',
      userId: user.id,
      videoId: video.id,
      sourceKey: fileKey,
      sourceBucket: process.env.UPLOAD_BUCKET,
      priority: 5
    });

    res.json({
      success: true,
      video: {
        id: video.id,
        title: video.title,
        status: video.status,
        createdAt: video.createdAt
      }
    });

  } catch (error) {
    console.error('Error completing upload:', error);
    res.status(500).json({ error: 'Failed to complete upload' });
  }
});

/**
 * GET /api/upload/status/:videoId
 * Check processing status
 */
router.get('/status/:videoId', async (req, res) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { videoId } = req.params;
    const { getVideo } = require('../resolvers/dynamodb-helpers');
    
    const video = await getVideo(videoId);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (video.userId !== user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      video: {
        id: video.id,
        status: video.status,
        progress: video.progress || 0,
        error: video.error || null
      }
    });

  } catch (error) {
    console.error('Error checking upload status:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

module.exports = router;
