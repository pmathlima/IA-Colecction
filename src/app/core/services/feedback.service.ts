import { Injectable, signal } from '@angular/core';

import { FeedbackMessage, FeedbackType } from '../models/feedback.model';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly messageState = signal<FeedbackMessage | null>(null);
  private timeoutId: number | null = null;

  readonly message = this.messageState.asReadonly();

  show(text: string, type: FeedbackType = 'info'): void {
    this.messageState.set({ text, type });

    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }

    this.timeoutId = window.setTimeout(() => this.clear(), 3200);
  }

  clear(): void {
    this.messageState.set(null);
    this.timeoutId = null;
  }
}
