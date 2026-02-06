// AWS S3 Client
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Config } from '../../0-core/aws/s3/config.js';
import { logger } from '../../0-core/logging/logger.js';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export class S3Service {
  // Upload file
  static async uploadFile(bucket, key, body, contentType) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType
      });

      await s3Client.send(command);
      logger.info('File uploaded to S3', { bucket, key });

      return {
        url: `https://${bucket}.s3.amazonaws.com/${key}`,
        key
      };
    } catch (error) {
      logger.error('S3 upload failed:', error);
      throw error;
    }
  }

  // Get file
  static async getFile(bucket, key) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
      });

      const response = await s3Client.send(command);
      return response.Body;
    } catch (error) {
      logger.error('S3 get failed:', error);
      throw error;
    }
  }

  // Delete file
  static async deleteFile(bucket, key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key
      });

      await s3Client.send(command);
      logger.info('File deleted from S3', { bucket, key });
      return true;
    } catch (error) {
      logger.error('S3 delete failed:', error);
      throw error;
    }
  }

  // List files
  static async listFiles(bucket, prefix = '') {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix
      });

      const response = await s3Client.send(command);
      return response.Contents || [];
    } catch (error) {
      logger.error('S3 list failed:', error);
      throw error;
    }
  }

  // Generate presigned URL
  static async getPresignedUrl(bucket, key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      logger.error('S3 presigned URL failed:', error);
      throw error;
    }
  }

  // Upload video
  static async uploadVideo(file) {
    const key = `videos/${Date.now()}-${file.originalname}`;
    return await this.uploadFile(
      s3Config.buckets.videos,
      key,
      file.buffer,
      file.mimetype
    );
  }

  // Upload thumbnail
  static async uploadThumbnail(file) {
    const key = `thumbnails/${Date.now()}-${file.originalname}`;
    return await this.uploadFile(
      s3Config.buckets.assets,
      key,
      file.buffer,
      file.mimetype
    );
  }

  // Delete video
  static async deleteVideo(key) {
    return await this.deleteFile(s3Config.buckets.videos, key);
  }
}

export default S3Service;
