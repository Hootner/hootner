/**
 * S3 Upload Service
 * Handles video and file uploads to S3 buckets
 */

import { config } from 'dotenv';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';

// Load environment variables
config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.IS_OFFLINE === 'true' && {
    endpoint: 'http://localhost:4566',
    forcePathStyle: true
  })
});

const UPLOAD_BUCKET = process.env.UPLOAD_BUCKET || 'hootner-uploads-504165876439';
const VIDEO_BUCKET = process.env.VIDEO_BUCKET || 'hootner-uploads-504165876439';
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

/**
 * Generate presigned URL for upload
 * @param {string} userId - User ID
 * @param {string} filename - Original filename
 * @param {string} contentType - MIME type
 * @returns {Promise<object>} Upload URL and file key
 */
async function generateUploadURL(userId, filename, contentType) {
  const fileExtension = path.extname(filename);
  const fileKey = `uploads/${userId}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: UPLOAD_BUCKET,
    Key: fileKey,
    ContentType: contentType,
    Metadata: {
      userId,
      originalName: filename,
      uploadedAt: new Date().toISOString()
    }
  });

  const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return {
    uploadURL,
    fileKey,
    bucket: UPLOAD_BUCKET,
    expiresIn: 3600
  };
}

/**
 * Move file from upload bucket to video storage
 * @param {string} sourceKey - Source file key in upload bucket
 * @param {string} userId - User ID
 * @param {string} videoId - Video ID
 * @returns {Promise<string>} New file key in video bucket
 */
async function moveToVideoStorage(sourceKey, userId, videoId) {
  const fileExtension = path.extname(sourceKey);
  const destKey = `videos/${userId}/${videoId}/original${fileExtension}`;

  // Get object from upload bucket
  const getCommand = new GetObjectCommand({
    Bucket: UPLOAD_BUCKET,
    Key: sourceKey
  });
  const { Body, ContentType, Metadata } = await s3Client.send(getCommand);

  // Put to video bucket
  const putCommand = new PutObjectCommand({
    Bucket: VIDEO_BUCKET,
    Key: destKey,
    Body: Body,
    ContentType: ContentType,
    Metadata: {
      ...Metadata,
      videoId,
      processedAt: new Date().toISOString()
    }
  });
  await s3Client.send(putCommand);

  // Delete from upload bucket
  const deleteCommand = new DeleteObjectCommand({
    Bucket: UPLOAD_BUCKET,
    Key: sourceKey
  });
  await s3Client.send(deleteCommand);

  return destKey;
}

/**
 * Generate presigned URL for viewing/downloading
 * @param {string} fileKey - File key in S3
 * @param {string} bucket - Bucket name (optional)
 * @returns {Promise<string>} Presigned URL
 */
async function generateViewURL(fileKey, bucket = VIDEO_BUCKET) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: fileKey
  });

  return getSignedUrl(s3Client, command, { expiresIn: 86400 }); // 24 hours
}

/**
 * Delete file from S3
 * @param {string} fileKey - File key
 * @param {string} bucket - Bucket name
 */
async function deleteFile(fileKey, bucket = VIDEO_BUCKET) {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: fileKey
  });

  await s3Client.send(command);
}

/**
 * Validate file upload
 * @param {string} filename - Filename
 * @param {number} fileSize - File size in bytes
 * @param {string} contentType - MIME type
 */
function validateUpload(filename, fileSize, contentType) {
  const allowedVideoTypes = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska'
  ];

  const allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  const allowedTypes = [...allowedVideoTypes, ...allowedImageTypes];

  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024 * 1024)}GB`);
  }

  if (!allowedTypes.includes(contentType)) {
    throw new Error(`File type ${contentType} is not allowed`);
  }

  return true;
}

export {
  generateUploadURL,
  moveToVideoStorage,
  generateViewURL,
  deleteFile,
  validateUpload,
  s3Client
};
