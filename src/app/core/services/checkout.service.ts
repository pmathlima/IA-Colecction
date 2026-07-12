import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { CartItem } from '../models/cart-item.model';
import { CustomerData, Order } from '../models/order.model';
import { CustomerAuthService } from './customer-auth.service';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly http = inject(HttpClient);
  private readonly customerAuthService = inject(CustomerAuthService);

  createOrder(customer: CustomerData, items: CartItem[]): Observable<Order> {
    const payload = {
      cliente: customer,
      itens: items.map((item) => ({
        produtoId: item.produto.id,
        variacaoId: item.variacao?.id ?? null,
        quantidade: item.quantidade,
      })),
    };

    return this.http.post<Order>(`${API_BASE_URL}/orders`, payload, {
      headers: this.customerAuthService.authHeaders(),
    });
  }
}
