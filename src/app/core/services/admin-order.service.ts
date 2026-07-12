import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { Order, OrderStatus } from '../models/order.model';
import { AdminAuthService } from './admin-auth.service';

@Injectable({ providedIn: 'root' })
export class AdminOrderService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AdminAuthService);

  listOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${API_BASE_URL}/admin/orders`, {
      headers: this.authHeaders(),
    });
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${API_BASE_URL}/admin/orders/${id}`, {
      headers: this.authHeaders(),
    });
  }

  updateStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(
      `${API_BASE_URL}/admin/orders/${id}/status`,
      { status },
      { headers: this.authHeaders() },
    );
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
