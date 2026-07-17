export const MARK_READ = `mutation($input: notification_MarkReadRequest_Input) {
  notification_NotificationService_MarkRead(input: $input) {
    id status
  }
}`;

export const MARK_ALL_READ = `mutation($input: notification_MarkAllReadRequest_Input) {
  notification_NotificationService_MarkAllRead(input: $input) {
    updated
  }
}`;
