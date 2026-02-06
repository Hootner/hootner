#!/usr/bin/env node

/**
 * Setup Stable Diffusion Training
 * Prepares everything needed for AWS training
 */

import 'dotenv/config';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET = process.env.TRAINING_DATA_BUCKET || process.env.UPLOAD_BUCKET || process.env.VIDEO_BUCKET;
const s3 = new S3Client({ region: REGION });

async function setupTraining() {
  console.log('🦉 Setting up Stable Diffusion Training\n');

  if (!BUCKET) {
    console.log('❌ No S3 bucket configured for training. Set TRAINING_DATA_BUCKET (or UPLOAD_BUCKET/VIDEO_BUCKET) in .env');
    process.exit(1);
  }

  // 1. Upload training scripts/config/prompts to S3
  // Keep in sync with config/aws_training_config.json:
  // - s3_scripts_prefix: scripts/
  // - prompts_s3_key: training_prompts.json (stored under scripts/)
  const files = [
    { local: join('scripts', 'aws_train_sd.py'), s3Key: 'scripts/aws_train_sd.py' },
    { local: join('config', 'aws_training_config.json'), s3Key: 'scripts/aws_training_config.json' },
    { local: join('config', 'training_prompts.json'), s3Key: 'scripts/training_prompts.json' },
    { local: join('scripts', 'setup_aws_training.sh'), s3Key: 'scripts/setup_aws_training.sh' },
  ];

  for (const file of files) {
    if (existsSync(file.local)) {
      try {
        const content = readFileSync(file.local);
        await s3.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: file.s3Key,
          Body: content
        }));
        console.log(`✅ Uploaded ${file.local} → s3://${BUCKET}/${file.s3Key}`);
      } catch (error) {
        console.log(`❌ Failed to upload ${file.local}: ${error.message}`);
      }
    } else {
      console.log(`⚠️  ${file.local} not found`);
    }
  }

  console.log('\n📋 Next steps:');
  console.log('1. Add training images to training_images/ folder');
  console.log(`2. Run: aws s3 sync training_images/ s3://${BUCKET}/training-data/images/ --region ${REGION}`);
  console.log('3. Run: python scripts/launch_aws_training.py --action launch --config config/aws_training_config.json');
}

setupTraining().catch(console.error);
