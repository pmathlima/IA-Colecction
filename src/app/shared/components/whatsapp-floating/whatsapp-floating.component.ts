import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { STORE_WHATSAPP_DISPLAY } from '../../../core/config/store.config';
import { WhatsappService } from '../../../core/services/whatsapp.service';

@Component({
  selector: 'app-whatsapp-floating',
  standalone: true,
  templateUrl: './whatsapp-floating.component.html',
  styleUrl: './whatsapp-floating.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatsappFloatingComponent {
  protected readonly whatsappDisplay = STORE_WHATSAPP_DISPLAY;

  private readonly whatsappService = inject(WhatsappService);

  openWhatsapp(): void {
    this.whatsappService.openGeneralContact();
  }
}
