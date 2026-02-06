// AWS SES Configuration (Centralized)
import { SESClient } from '@aws-sdk/client-ses';

export const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

export const sesConfig = {
  fromEmail: process.env.SES_FROM_EMAIL || 'noreply@hootner.com',
  replyToEmail: process.env.SES_REPLY_TO || 'support@hootner.com',
  verifiedDomains: process.env.SES_VERIFIED_DOMAINS?.split(',') || ['hootner.com']
};

export default sesClient;
