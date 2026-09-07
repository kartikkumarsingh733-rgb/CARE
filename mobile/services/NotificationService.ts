import * as Device from 'expo-device';
import { Platform } from 'react-native';

// In Expo SDK 53, expo-notifications was removed from Expo Go on Android and causes crashes on import/usage.
// For prototyping in Expo Go, we will mock the notification service.
// In a real production build (Development Build), you would re-enable expo-notifications.

export class NotificationService {
  /**
   * Request permissions to send push notifications (Mocked)
   */
  static async requestPermissionsAsync() {
    console.log('[NotificationService] Mock: Requested permissions.');
    return true;
  }

  /**
   * Schedule a local notification (Mocked)
   */
  static async scheduleReminder(
    title: string,
    body: string,
    triggerTime: Date,
    data?: any
  ): Promise<string> {
    const id = `mock-notif-${Date.now()}`;
    console.log(`[NotificationService] Mock: Scheduled "${title}" for ${triggerTime.toISOString()}`);
    return id;
  }

  /**
   * Schedule a reminder for a specific amount of seconds from now (for testing) (Mocked)
   */
  static async scheduleReminderInSeconds(
    title: string,
    body: string,
    seconds: number,
    data?: any
  ): Promise<string> {
    const id = `mock-notif-sec-${Date.now()}`;
    console.log(`[NotificationService] Mock: Scheduled "${title}" in ${seconds}s`);
    return id;
  }

  /**
   * Cancel a scheduled notification (Mocked)
   */
  static async cancelReminder(notificationId: string) {
    console.log(`[NotificationService] Mock: Cancelled notification ${notificationId}`);
  }
}

