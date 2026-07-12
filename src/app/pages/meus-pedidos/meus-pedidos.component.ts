import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ORDER_STATUS_LABELS, Order } from '../../core/models/order.model';
import { CustomerOrderService } from '../../core/services/customer-order.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';
import { BrlCurrencyPipe } from '../../shared/pipes/brl-currency.pipe';

@Component({
  selector: 'app-meus-pedidos',
  standalone: true,
  imports: [RouterLink, DatePipe, UiButtonComponent, BrlCurrencyPipe],
  templateUrl: './meus-pedidos.component.html',
  styleUrl: './meus-pedidos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeusPedidosComponent implements OnInit {
  protected readonly orders = signal<Order[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly totalOrders = computed(() => this.orders().length);
  protected readonly totalValue = computed(() => this.orders().reduce((total, order) => total + order.total, 0));
  protected readonly statusLabels = ORDER_STATUS_LABELS;

  private readonly orderService = inject(CustomerOrderService);
  private readonly feedbackService = inject(FeedbackService);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading.set(true);
    this.orderService
      .listOrders()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (orders) => this.orders.set(orders),
        error: () => this.feedbackService.show('Não foi possível carregar seus pedidos.', 'error'),
      });
  }
}
