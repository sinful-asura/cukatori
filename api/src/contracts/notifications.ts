export interface NotificationDto {
  id: string;
  kind: string;
  title: string;
  body: string;
  readAt: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}
