// Firebase Client (Push Notifications)
import admin from 'firebase-admin';
import { logger } from '../../0-core/logging/logger.js';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

export class FirebaseClient {
  // Send push notification
  static async sendPushNotification(token, notification) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {},
        token
      };

      const response = await admin.messaging().send(message);
      logger.info('Push notification sent', { messageId: response });
      return response;
    } catch (error) {
      logger.error('Push notification failed:', error);
      throw error;
    }
  }

  // Send to multiple devices
  static async sendMulticast(tokens, notification) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {},
        tokens
      };

      const response = await admin.messaging().sendMulticast(message);
      logger.info('Multicast notification sent', {
        successCount: response.successCount,
        failureCount: response.failureCount
      });
      return response;
    } catch (error) {
      logger.error('Multicast notification failed:', error);
      throw error;
    }
  }

  // Send to topic
  static async sendToTopic(topic, notification) {
    try {
      const message = {
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {},
        topic
      };

      const response = await admin.messaging().send(message);
      logger.info('Topic notification sent', { topic, messageId: response });
      return response;
    } catch (error) {
      logger.error('Topic notification failed:', error);
      throw error;
    }
  }

  // Subscribe to topic
  static async subscribeToTopic(tokens, topic) {
    try {
      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      logger.info('Subscribed to topic', { topic, successCount: response.successCount });
      return response;
    } catch (error) {
      logger.error('Topic subscription failed:', error);
      throw error;
    }
  }

  // Unsubscribe from topic
  static async unsubscribeFromTopic(tokens, topic) {
    try {
      const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
      logger.info('Unsubscribed from topic', { topic });
      return response;
    } catch (error) {
      logger.error('Topic unsubscription failed:', error);
      throw error;
    }
  }

  // Verify ID token
  static async verifyIdToken(idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw error;
    }
  }
}

export default FirebaseClient;
