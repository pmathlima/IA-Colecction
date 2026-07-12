import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ORDER_STATUS_LABELS, Order, OrderStatus } from '../../core/models/order.model';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { AdminOrderService } from '../../core/services/admin-order.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';
import { BrlCurrencyPipe } from '../../shared/pipes/brl-currency.pipe';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [RouterLink, DatePipe, UiButtonComponent, BrlCurrencyPipe],
  templateUrl: './admin-pedidos.component.html',
  styleUrl: './admin-pedidos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPedidosComponent implements OnInit {
  protected readonly orders = signal<Order[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly adminName = computed(() => this.authService.currentAdminName() ?? 'Administrador');
  protected readonly totalOrders = computed(() => this.orders().length);
  protected readonly pendingOrders = computed(() =>
    this.orders().filter((order) => ['NOVO', 'EM_ANALISE', 'CONFIRMADO'].includes(order.status)).length,
  );
  protected readonly revenue = computed(() =>
    this.orders()
      .filter((order) => order.status !== 'CANCELADO')
      .reduce((total, order) => total + order.total, 0),
  );

  private readonly orderService = inject(AdminOrderService);
  private readonly authService = inject(AdminAuthService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly router = inject(Router);

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
        error: () => this.feedbackService.show('Não foi possível carregar os pedidos do painel.', 'error'),
      });
  }

  statusLabel(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status] ?? status;
  }

  statusClass(status: OrderStatus): string {
    return `status--${status.toLowerCase().replace('_', '-')}`;
  }

  logout(): void {
    this.authService.logout();
    this.feedbackService.show('Sessão administrativa encerrada.', 'success');
    void this.router.navigate(['/admin/login']);
  }
}
