// File Upload Handler
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, bucketConfig } from '../aws/s3/config.js';

// Memory storage for direct upload to S3
const memoryStorage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only videos and images allowed.'), false);
  }
};

// Multer configuration
export const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
    files: 1
  }
});

// Upload to S3
export const uploadToS3 = async (file, folder = 'uploads') => {
  const key = `${folder}/${uuidv4()}${path.extname(file.originalname)}`;

  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketConfig.uploadBucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        originalName: file.originalname,
        uploadDate: new Date().toISOString()
      }
    }));

    return {
      key,
      url: `https://${bucketConfig.uploadBucket}.s3.amazonaws.com/${key}`,
      size: file.size,
      mimetype: file.mimetype
    };
  } catch (error) {
    console.error('S3 upload failed:', error);
    throw error;
  }
};

// Middleware for single file upload
export const uploadSingle = (fieldName = 'file') => {
  return upload.single(fieldName);
};

// Middleware for multiple files
export const uploadMultiple = (fieldName = 'files', maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

export default { upload, uploadToS3, uploadSingle, uploadMultiple };
