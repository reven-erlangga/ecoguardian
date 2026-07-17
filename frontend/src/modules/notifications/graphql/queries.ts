export const GET_NOTIFICATIONS = `query($input: notification_ListNotificationsRequest_Input) {
  notification_NotificationService_ListNotifications(input: $input) {
    notifications { id user_id type channel title content status created_at read_at }
    total
  }
}`;
