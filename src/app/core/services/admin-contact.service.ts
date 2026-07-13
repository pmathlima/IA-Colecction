import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { ContactResponse, ContactStatus } from '../models/contact.model';
import { AdminAuthService } from './admin-auth.service';

@Injectable({ providedIn: 'root' })
export class AdminContactService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AdminAuthService);

  listMessages(status?: ContactStatus | 'TODAS'): Observable<ContactResponse[]> {
    let params = new HttpParams();

    if (status && status !== 'TODAS') {
      params = params.set('status_filter', status);
    }

    return this.http.get<ContactResponse[]>(`${API_BASE_URL}/admin/contact-messages`, {
      headers: this.authHeaders(),
      params,
    });
  }

  getMessage(id: number): Observable<ContactResponse> {
    return this.http.get<ContactResponse>(`${API_BASE_URL}/admin/contact-messages/${id}`, {
      headers: this.authHeaders(),
    });
  }

  updateStatus(id: number, status: ContactStatus): Observable<ContactResponse> {
    return this.http.patch<ContactResponse>(
      `${API_BASE_URL}/admin/contact-messages/${id}/status`,
      { status },
      { headers: this.authHeaders() },
    );
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/admin/contact-messages/${id}`, {
      headers: this.authHeaders(),
    });
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
