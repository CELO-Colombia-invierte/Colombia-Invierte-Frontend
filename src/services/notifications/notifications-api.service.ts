import { apiService } from '../api';
import {
  Notification,
  NotificationListResponse,
  UnreadCountResponse,
} from '@/types';

interface NotificationQueryParams {
  limit?: number;
  offset?: number;
  unread_only?: boolean;
}

class NotificationsApiService {
  async getNotifications(
    params: NotificationQueryParams = {}
  ): Promise<NotificationListResponse> {
    const queryParams = new URLSearchParams();

    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.unread_only) queryParams.append('unread_only', 'true');

    const queryString = queryParams.toString();
    const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`;

    const response = await apiService.get<NotificationListResponse>(endpoint);
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<UnreadCountResponse>(
      '/notifications/unread-count'
    );
    return response.data.unread_count;
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await apiService.patch<Notification>(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  }

  async markAllAsRead(): Promise<{ marked_count: number }> {
    const response = await apiService.patch<{ marked_count: number }>(
      '/notifications/read-all'
    );
    return response.data;
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await apiService.delete(`/notifications/${notificationId}`);
  }
}

export const notificationsApiService = new NotificationsApiService();
