import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { FeedbackService } from '../../../core/services/feedback.service';

@Component({
  selector: 'app-feedback-message',
  standalone: true,
  templateUrl: './feedback-message.component.html',
  styleUrl: './feedback-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackMessageComponent {
  protected readonly feedbackService = inject(FeedbackService);
}
