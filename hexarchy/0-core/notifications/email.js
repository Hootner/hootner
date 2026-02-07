// AWS SES Email Service
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'noreply@hootner.com';

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const command = new SendEmailCommand({
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to]
      },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: html },
          Text: { Data: text || html.replace(/<[^>]*>/g, '') }
        }
      }
    });

    const response = await sesClient.send(command);
    console.log('✅ Email sent:', response.MessageId);
    return response;
  } catch (error) {
    console.error('❌ Email send failed:', error);
    throw error;
  }
};

// Common email templates
export const sendWelcomeEmail = async (to, username) => {
  return sendEmail({
    to,
    subject: 'Welcome to HOOTNER! 🦉',
    html: `
      <h1>Welcome to HOOTNER, ${username}!</h1>
      <p>Thank you for joining our platform. Start exploring amazing video content today.</p>
      <a href="${process.env.APP_URL}/dashboard">Go to Dashboard</a>
    `
  });
};

export const sendPasswordResetEmail = async (to, resetToken) => {
  return sendEmail({
    to,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${process.env.APP_URL}/reset-password?token=${resetToken}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    `
  });
};

export const sendVideoProcessedEmail = async (to, videoTitle) => {
  return sendEmail({
    to,
    subject: 'Your video is ready! 🎬',
    html: `
      <h1>Video Processing Complete</h1>
      <p>Your video "${videoTitle}" has been successfully processed and is now live.</p>
      <a href="${process.env.APP_URL}/my-videos">View Your Videos</a>
    `
  });
};

export default { sendEmail, sendWelcomeEmail, sendPasswordResetEmail, sendVideoProcessedEmail };
