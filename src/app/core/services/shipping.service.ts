import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { ShippingCalculateResponse } from '../models/shipping.model';

@Injectable({ providedIn: 'root' })
export class ShippingService {
  private readonly http = inject(HttpClient);

  calculateShipping(cep: string, subtotal: number): Observable<ShippingCalculateResponse> {
    return this.http.post<ShippingCalculateResponse>(`${API_BASE_URL}/shipping/calculate`, {
      cep,
      subtotal,
    });
  }
}
