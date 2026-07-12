import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ORDER_STATUS_LABELS, Order } from '../../core/models/order.model';
import { CustomerOrderService } from '../../core/services/customer-order.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { WhatsappService } from '../../core/services/whatsapp.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';
import { BrlCurrencyPipe } from '../../shared/pipes/brl-currency.pipe';

@Component({
  selector: 'app-meu-pedido-detalhe',
  standalone: true,
  imports: [RouterLink, DatePipe, UiButtonComponent, BrlCurrencyPipe],
  templateUrl: './meu-pedido-detalhe.component.html',
  styleUrl: './meu-pedido-detalhe.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeuPedidoDetalheComponent implements OnInit {
  protected readonly order = signal<Order | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly statusLabels = ORDER_STATUS_LABELS;

  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(CustomerOrderService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly whatsappService = inject(WhatsappService);

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');

    if (!orderId) {
      this.feedbackService.show('Pedido não informado.', 'error');
      return;
    }

    this.loadOrder(orderId);
  }

  confirmOnWhatsapp(order: Order): void {
    this.whatsappService.openOrderConfirmation(order);
  }

  private loadOrder(orderId: string): void {
    this.isLoading.set(true);
    this.orderService
      .getOrder(orderId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (order) => this.order.set(order),
        error: () => this.feedbackService.show('Não foi possível carregar o pedido.', 'error'),
      });
  }
}
