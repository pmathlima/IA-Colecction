import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AdminDashboardResponse, AdminDashboardSalesPoint } from '../../core/models/admin-dashboard.model';
import { CONTACT_STATUS_LABELS, ContactStatus } from '../../core/models/contact.model';
import { ORDER_STATUS_LABELS, OrderStatus } from '../../core/models/order.model';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { AdminDashboardService } from '../../core/services/admin-dashboard.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { BrlCurrencyPipe } from '../../shared/pipes/brl-currency.pipe';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, BrlCurrencyPipe, ImageUrlPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit {
  protected readonly dashboard = signal<AdminDashboardResponse | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly adminName = computed(() => this.authService.currentAdminName() ?? 'Administrador');

  protected readonly maxSalesValue = computed(() => {
    const sales = this.dashboard()?.vendasUltimosSeteDias ?? [];
    return Math.max(...sales.map((item) => item.total), 1);
  });

  protected readonly totalStatus = computed(() =>
    (this.dashboard()?.statusPedidos ?? []).reduce((total, item) => total + item.total, 0),
  );

  protected readonly statusGradient = computed(() => {
    const statuses = this.dashboard()?.statusPedidos.filter((item) => item.total > 0) ?? [];
    const total = statuses.reduce((sum, item) => sum + item.total, 0);

    if (!total) {
      return 'conic-gradient(rgba(120, 14, 45, 0.12) 0 100%)';
    }

    const colors = ['#780e2d', '#d9879a', '#a8753a', '#7f9b76', '#d4a64f', '#d6cfc4'];
    let start = 0;
    const stops = statuses.map((item, index) => {
      const slice = (item.total / total) * 100;
      const stop = `${colors[index % colors.length]} ${start}% ${start + slice}%`;
      start += slice;
      return stop;
    });

    return `conic-gradient(${stops.join(', ')})`;
  });

  private readonly dashboardService = inject(AdminDashboardService);
  private readonly authService = inject(AdminAuthService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);

    this.dashboardService
      .getDashboard()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (dashboard) => this.dashboard.set(dashboard),
        error: () => this.feedbackService.show('Não foi possível carregar o dashboard administrativo.', 'error'),
      });
  }

  salesBarHeight(point: AdminDashboardSalesPoint): string {
    const percentage = Math.max((point.total / this.maxSalesValue()) * 100, point.total > 0 ? 10 : 2);
    return `${percentage}%`;
  }

  orderStatusLabel(status: string): string {
    return ORDER_STATUS_LABELS[status as OrderStatus] ?? status;
  }

  contactStatusLabel(status: string): string {
    return CONTACT_STATUS_LABELS[status as ContactStatus] ?? status;
  }

  statusClass(status: string): string {
    return `status--${status.toLowerCase().replace('_', '-')}`;
  }

  logout(): void {
    this.authService.logout();
    this.feedbackService.show('Sessão administrativa encerrada.', 'success');
    void this.router.navigate(['/admin/login']);
  }
}
