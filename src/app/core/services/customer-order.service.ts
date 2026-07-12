import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { Order } from '../models/order.model';
import { CustomerAuthService } from './customer-auth.service';

@Injectable({ providedIn: 'root' })
export class CustomerOrderService {
  private readonly http = inject(HttpClient);
  private readonly customerAuthService = inject(CustomerAuthService);

  listOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${API_BASE_URL}/customer/orders`, {
      headers: this.customerAuthService.authHeaders(),
    });
  }

  getOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${API_BASE_URL}/customer/orders/${orderId}`, {
      headers: this.customerAuthService.authHeaders(),
    });
  }
}
