#!/usr/bin/env node

/**
 * Setup Stable Diffusion Training
 * Prepares everything needed for AWS training
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, existsSync } from 'fs';

const BUCKET = 'hootner-frontend-504165876439';
const s3 = new S3Client({ region: 'us-east-1' });

async function setupTraining() {
  console.log('🦉 Setting up Stable Diffusion Training\n');

  // 1. Upload training scripts to S3
  const files = [
    'aws_train_sd.py',
    'aws_training_config.json', 
    'training_prompts.json',
    'setup_aws_training.sh'
  ];

  for (const file of files) {
    if (existsSync(file)) {
      try {
        const content = readFileSync(file);
        await s3.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: `training-scripts/${file}`,
          Body: content
        }));
        console.log(`✅ Uploaded ${file}`);
      } catch (error) {
        console.log(`❌ Failed to upload ${file}: ${error.message}`);
      }
    } else {
      console.log(`⚠️  ${file} not found`);
    }
  }

  console.log('\n📋 Next steps:');
  console.log('1. Add training images to training_images/ folder');
  console.log('2. Run: aws s3 sync training_images/ s3://hootner-frontend-504165876439/training-data/images/');
  console.log('3. Run: python launch_aws_training.py --action launch');
}

setupTraining().catch(console.error);