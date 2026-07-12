export type FeedbackType = 'success' | 'error' | 'info';

export interface FeedbackMessage {
  type: FeedbackType;
  text: string;
}
