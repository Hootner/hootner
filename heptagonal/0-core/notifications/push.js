// AWS SNS Push Notifications
import { SNSClient, PublishCommand, CreateTopicCommand, SubscribeCommand } from '@aws-sdk/client-sns';

const snsClient = new SNSClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

export const sendPushNotification = async ({ phoneNumber, message }) => {
  try {
    const command = new PublishCommand({
      PhoneNumber: phoneNumber,
      Message: message
    });

    const response = await snsClient.send(command);
    console.log('✅ Push notification sent:', response.MessageId);
    return response;
  } catch (error) {
    console.error('❌ Push notification failed:', error);
    throw error;
  }
};

export const createTopic = async (topicName) => {
  try {
    const command = new CreateTopicCommand({
      Name: topicName
    });

    const response = await snsClient.send(command);
    return response.TopicArn;
  } catch (error) {
    console.error('❌ Topic creation failed:', error);
    throw error;
  }
};

export const subscribeTopic = async (topicArn, protocol, endpoint) => {
  try {
    const command = new SubscribeCommand({
      TopicArn: topicArn,
      Protocol: protocol, // 'email', 'sms', 'http', 'https'
      Endpoint: endpoint
    });

    const response = await snsClient.send(command);
    return response.SubscriptionArn;
  } catch (error) {
    console.error('❌ Topic subscription failed:', error);
    throw error;
  }
};

export const publishToTopic = async (topicArn, message, subject) => {
  try {
    const command = new PublishCommand({
      TopicArn: topicArn,
      Message: message,
      Subject: subject
    });

    const response = await snsClient.send(command);
    console.log('✅ Topic message published:', response.MessageId);
    return response;
  } catch (error) {
    console.error('❌ Topic publish failed:', error);
    throw error;
  }
};

export default { sendPushNotification, createTopic, subscribeTopic, publishToTopic };
