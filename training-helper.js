#!/usr/bin/env node

/**
 * Simple Stable Diffusion Training Restart
 * Helps you get training back on track
 */

console.log('🦉 HOOTNER Stable Diffusion Training Helper\n');

console.log('📋 Current Status:');
console.log('❌ No active training instances found');
console.log('❌ No training data found in S3');
console.log('❌ No trained models found\n');

console.log('🚀 To restart your training:\n');

console.log('1️⃣ First, upload your training images:');
console.log('   mkdir training-images');
console.log('   # Put your images in training-images/ folder');
console.log('   aws s3 sync training-images/ s3://hootner-frontend-504165876439/training-data/images/\n');

console.log('2️⃣ Update the config file:');
console.log('   # Edit aws_training_config.json');
console.log('   # Change s3_bucket to: "hootner-frontend-504165876439"\n');

console.log('3️⃣ Launch training instance:');
console.log('   python launch_aws_training.py --action launch\n');

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