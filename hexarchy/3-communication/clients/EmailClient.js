// Email Client (AWS SES)
import { SESClient, SendEmailCommand, SendTemplatedEmailCommand } from '@aws-sdk/client-ses';
import { logger } from '../../0-core/logging/logger.js';

const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export class EmailClient {
  static FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@hootner.com';

  // Send basic email
  static async sendEmail({ to, subject, body, html }) {
    try {
      const command = new SendEmailCommand({
        Source: this.FROM_EMAIL,
        Destination: {
          ToAddresses: Array.isArray(to) ? to : [to]
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8'
          },
          Body: {
            Text: body ? {
              Data: body,
              Charset: 'UTF-8'
            } : undefined,
            Html: html ? {
              Data: html,
              Charset: 'UTF-8'
            } : undefined
          }
        }
      });

      const response = await sesClient.send(command);
      logger.info('Email sent', { to, messageId: response.MessageId });
      return response;
    } catch (error) {
      logger.error('Email send failed:', error);
      throw error;
    }
  }

  // Send templated email
  static async sendTemplatedEmail({ to, templateName, templateData }) {
    try {
      const command = new SendTemplatedEmailCommand({
        Source: this.FROM_EMAIL,
        Destination: {
          ToAddresses: Array.isArray(to) ? to : [to]
        },
        Template: templateName,
        TemplateData: JSON.stringify(templateData)
      });

      const response = await sesClient.send(command);
      logger.info('Templated email sent', { to, template: templateName });
      return response;
    } catch (error) {
      logger.error('Templated email send failed:', error);
      throw error;
    }
  }

  // Welcome email
  static async sendWelcomeEmail(email, username) {
    return await this.sendEmail({
      to: email,
      subject: 'Welcome to Hootner!',
      body: `Hi ${username},\n\nWelcome to Hootner! We're excited to have you on board.`,
      html: `<h1>Hi ${username},</h1><p>Welcome to Hootner! We're excited to have you on board.</p>`
    });
  }

  // Password reset email
  static async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

    return await this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      body: `Reset your password: ${resetUrl}`,
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    });
  }

  // Video processed email
  static async sendVideoProcessedEmail(email, videoTitle, videoUrl) {
    return await this.sendEmail({
      to: email,
      subject: 'Your video is ready!',
      body: `Your video "${videoTitle}" has been processed and is now live!`,
      html: `<p>Your video "<strong>${videoTitle}</strong>" has been processed and is now live!</p><p><a href="${videoUrl}">Watch now</a></p>`
    });
  }
}

export default EmailClient;
