import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ORDER_STATUS_LABELS, Order } from '../../core/models/order.model';
import { CustomerAuthService } from '../../core/services/customer-auth.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';
import { BrlCurrencyPipe } from '../../shared/pipes/brl-currency.pipe';

const LAST_ORDER_STORAGE_KEY = 'ia-collection-last-order';

@Component({
  selector: 'app-pedido-confirmado',
  standalone: true,
  imports: [RouterLink, DatePipe, UiButtonComponent, BrlCurrencyPipe],
  templateUrl: './pedido-confirmado.component.html',
  styleUrl: './pedido-confirmado.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PedidoConfirmadoComponent implements OnInit {
  protected readonly order = signal<Order | null>(null);
  protected readonly statusLabels = ORDER_STATUS_LABELS;
  protected readonly customerAuthService = inject(CustomerAuthService);

  private readonly whatsappService = inject(WhatsappService);

  ngOnInit(): void {
    const storedOrder = sessionStorage.getItem(LAST_ORDER_STORAGE_KEY);

    if (!storedOrder) {
      return;
    }

    try {
      this.order.set(JSON.parse(storedOrder) as Order);
    } catch {
      sessionStorage.removeItem(LAST_ORDER_STORAGE_KEY);
    }
  }

  confirmOnWhatsapp(order: Order): void {
    this.whatsappService.openOrderConfirmation(order);
  }
}
