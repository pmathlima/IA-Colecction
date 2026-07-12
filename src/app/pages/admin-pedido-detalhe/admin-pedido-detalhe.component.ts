import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  Order,
  OrderStatus,
} from '../../core/models/order.model';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { AdminOrderService } from '../../core/services/admin-order.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';
import { BrlCurrencyPipe } from '../../shared/pipes/brl-currency.pipe';

@Component({
  selector: 'app-admin-pedido-detalhe',
  standalone: true,
  imports: [RouterLink, DatePipe, UiButtonComponent, BrlCurrencyPipe],
  templateUrl: './admin-pedido-detalhe.component.html',
  styleUrl: './admin-pedido-detalhe.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPedidoDetalheComponent implements OnInit {
  protected readonly order = signal<Order | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isUpdating = signal(false);
  protected readonly statusOptions = ORDER_STATUS_OPTIONS;
  protected readonly adminName = computed(() => this.authService.currentAdminName() ?? 'Administrador');

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(AdminOrderService);
  private readonly authService = inject(AdminAuthService);
  private readonly feedbackService = inject(FeedbackService);

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');

    if (!orderId) {
      this.feedbackService.show('Pedido não encontrado.', 'error');
      void this.router.navigate(['/admin/pedidos']);
      return;
    }

    this.loadOrder(orderId);
  }

  loadOrder(orderId: string): void {
    this.isLoading.set(true);

    this.orderService
      .getOrder(orderId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (order) => this.order.set(order),
        error: () => {
          this.feedbackService.show('Não foi possível carregar o pedido.', 'error');
          void this.router.navigate(['/admin/pedidos']);
        },
      });
  }

  updateStatus(status: OrderStatus): void {
    const order = this.order();

    if (!order || order.status === status) {
      return;
    }

    this.isUpdating.set(true);

    this.orderService
      .updateStatus(order.id, status)
      .pipe(finalize(() => this.isUpdating.set(false)))
      .subscribe({
        next: (updatedOrder) => {
          this.order.set(updatedOrder);
          this.feedbackService.show('Status do pedido atualizado com sucesso.', 'success');
        },
        error: () => this.feedbackService.show('Não foi possível atualizar o status do pedido.', 'error'),
      });
  }

  statusLabel(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status] ?? status;
  }

  statusClass(status: OrderStatus): string {
    return `status--${status.toLowerCase().replace('_', '-')}`;
  }

  asOrderStatus(value: string): OrderStatus {
    return value as OrderStatus;
  }

  logout(): void {
    this.authService.logout();
    this.feedbackService.show('Sessão administrativa encerrada.', 'success');
    void this.router.navigate(['/admin/login']);
  }
}
