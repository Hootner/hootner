#!/usr/bin/env node

/**
 * Check Stable Diffusion Training Status
 * Helps troubleshoot AWS training issues
 */

import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { CloudWatchLogsClient, DescribeLogGroupsCommand } from '@aws-sdk/client-cloudwatch-logs';

async function checkTrainingStatus() {
  console.log('🔍 Checking Stable Diffusion Training Status...\n');

  const ec2 = new EC2Client({ region: 'us-east-1' });
  const s3 = new S3Client({ region: 'us-east-1' });
  const logs = new CloudWatchLogsClient({ region: 'us-east-1' });

  // 1. Check for training instances
  console.log('📊 Checking EC2 instances...');
  try {
    const instances = await ec2.send(new DescribeInstancesCommand({
      Filters: [
        { Name: 'tag:Purpose', Values: ['StableDiffusion-Training'] },
        { Name: 'instance-state-name', Values: ['running', 'stopped', 'terminated', 'pending'] }
      ]
    }));

    if (instances.Reservations.length === 0) {
      console.log('❌ No training instances found');
      console.log('   This means either:');
      console.log('   - Training was never started');
      console.log('   - Instance was terminated');
      console.log('   - Instance wasn\'t tagged properly\n');
    } else {
      instances.Reservations.forEach(reservation => {
        reservation.Instances.forEach(instance => {
          const name = instance.Tags?.find(tag => tag.Key === 'Name')?.Value || 'Unnamed';
          console.log(`✅ Found instance: ${instance.InstanceId}`);
          console.log(`   Name: ${name}`);
          console.log(`   State: ${instance.State.Name}`);
          console.log(`   Type: ${instance.InstanceType}`);
          console.log(`   Launch Time: ${instance.LaunchTime}`);
          if (instance.PublicIpAddress) {
            console.log(`   Public IP: ${instance.PublicIpAddress}`);
          }
          console.log('');
        });
      });
    }
  } catch (error) {
    console.log(`❌ Error checking instances: ${error.message}\n`);
  }

  // 2. Check S3 buckets for training data/outputs
  console.log('📦 Checking S3 buckets...');
  const buckets = ['hootner-frontend-504165876439', 'aws-sam-cli-managed-default-samclisourcebucket-ljfri0alqtmp'];
  
  for (const bucket of buckets) {
    try {
      console.log(`\n🪣 Checking bucket: ${bucket}`);
      
      // Check for training data
      const trainingData = await s3.send(new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: 'training-data/',
        MaxKeys: 10
      }));
      
      if (trainingData.Contents?.length > 0) {
        console.log(`   ✅ Found ${trainingData.Contents.length} training files`);
        trainingData.Contents.forEach(obj => {
          console.log(`      - ${obj.Key} (${Math.round(obj.Size / 1024)}KB)`);
        });
      } else {
        console.log('   ❌ No training data found');
      }

      // Check for trained models
      const models = await s3.send(new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: 'trained-models/',
        MaxKeys: 10
      }));
      
      if (models.Contents?.length > 0) {
        console.log(`   🎯 Found ${models.Contents.length} trained model files`);
        models.Contents.forEach(obj => {
          console.log(`      - ${obj.Key} (${Math.round(obj.Size / 1024 / 1024)}MB)`);
        });
      } else {
        console.log('   ❌ No trained models found');
      }

    } catch (error) {
      console.log(`   ❌ Error accessing bucket: ${error.message}`);
    }
  }

  // 3. Check CloudWatch logs
  console.log('\n📋 Checking CloudWatch logs...');
  try {
    const logGroups = await logs.send(new DescribeLogGroupsCommand({
      logGroupNamePrefix: '/aws/ec2'
    }));

    const trainingLogs = logGroups.logGroups?.filter(group => 
      group.logGroupName.includes('training') || 
      group.logGroupName.includes('stable-diffusion')
    );

    if (trainingLogs?.length > 0) {
      console.log(`✅ Found ${trainingLogs.length} potential training log groups`);
      trainingLogs.forEach(group => {
        console.log(`   - ${group.logGroupName}`);
      });
    } else {
      console.log('❌ No training-related log groups found');
    }
  } catch (error) {
    console.log(`❌ Error checking logs: ${error.message}`);
  }

  // 4. Recommendations
  console.log('\n💡 Recommendations:');
  console.log('');
  console.log('If no training was found:');
  console.log('1. Check if you actually launched the training:');
  console.log('   python launch_aws_training.py --action launch');
  console.log('');
  console.log('2. If you did launch it, the instance might have:');
  console.log('   - Failed to start (check EC2 console)');
  console.log('   - Run out of credits (check billing)');
  console.log('   - Been terminated due to errors');
  console.log('');
  console.log('3. To restart training:');
  console.log('   - Upload training images to S3 first');
  console.log('   - Launch new instance with proper configuration');
  console.log('   - Monitor the instance logs');
  console.log('');
  console.log('4. Alternative: Use SageMaker for more reliable training');
}

checkTrainingStatus().catch(console.error);