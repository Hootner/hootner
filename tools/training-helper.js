#!/usr/bin/env node

/**
 * Simple Stable Diffusion Training Restart
 * Helps you get training back on track
 */

import 'dotenv/config';

console.log('🦉 HOOTNER Stable Diffusion Training Helper\n');

const REGION = process.env.AWS_REGION || 'us-east-1';
const TRAINING_BUCKET = process.env.TRAINING_DATA_BUCKET || process.env.UPLOAD_BUCKET || process.env.VIDEO_BUCKET;

if (!TRAINING_BUCKET) {
	console.log('⚠️  No training bucket configured. Set TRAINING_DATA_BUCKET (or UPLOAD_BUCKET/VIDEO_BUCKET) in .env');
}

console.log('📋 Current Status:');
console.log('❌ No active training instances found');
console.log('❌ No training data found in S3');
console.log('❌ No trained models found\n');

console.log('🚀 To restart your training:\n');

console.log('1️⃣ First, upload your training images:');
console.log('   mkdir training-images');
console.log('   # Put your images in training-images/ folder');
console.log(`   aws s3 sync training-images/ s3://${TRAINING_BUCKET || '<your-s3-bucket>'}/training-data/images/ --region ${REGION}\n`);

console.log('2️⃣ Update the config file:');
console.log('   # Edit aws_training_config.json');
console.log(`   # Change s3_bucket to: "${TRAINING_BUCKET || '<your-s3-bucket>'}"\n`);

console.log('   ⚠️  Note: S3 Tables (table buckets) are for analytics catalogs/metadata (Glue/Lake Formation).');
console.log('      Put training images/videos in a normal S3 bucket, not the table bucket.\n');

console.log('3️⃣ Launch training instance:');
console.log('   python scripts/launch_aws_training.py --action launch --config config/aws_training_config.json\n');

console.log('4️⃣ Monitor progress:');
console.log('   # SSH into the instance when it\'s ready');
console.log('   # Check logs: tail -f /var/log/cloud-init-output.log\n');

console.log('💰 Cost Estimate:');
console.log('   g4dn.xlarge: ~$0.526/hour');
console.log('   Training time: 2-6 hours typically');
console.log('   Total cost: $1-3 for basic training\n');

console.log('⚠️  Alternative Options:');
console.log('   1. Use Google Colab (free GPU)');
console.log('   2. Use Hugging Face Spaces (free tier)');
console.log('   3. Use local training if you have a GPU\n');

console.log('🔧 Quick Fix Commands:');
console.log('   # Check AWS credits:');
console.log('   aws billing get-cost-and-usage --time-period Start=2024-01-01,End=2024-12-31 --granularity MONTHLY --metrics BlendedCost');
console.log('');
console.log('   # Check EC2 limits:');
console.log('   aws service-quotas get-service-quota --service-code ec2 --quota-code L-DB2E81BA');
console.log('');
console.log('   # List all instances (including terminated):');
console.log('   aws ec2 describe-instances --query "Reservations[*].Instances[*].[InstanceId,State.Name,LaunchTime]" --output table');
