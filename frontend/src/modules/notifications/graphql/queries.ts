export const GET_NOTIFICATIONS = `query($input: notification__GetNotificationsRequest_Input) {
  notification_NotificationService_GetNotifications(input: $input) {
    notifications { id user_id type channel title content status created_at { seconds } read_at { seconds } }
    pagination { total }
  }
}`;

export const MARK_READ = `mutation($input: notification__MarkReadRequest_Input) {
  notification_NotificationService_MarkRead(input: $input)
}`;
