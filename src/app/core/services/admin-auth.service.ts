import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { AdminLoginPayload, AdminLoginResponse } from '../models/admin.model';

const ADMIN_TOKEN_KEY = 'ia_collection_admin_token';
const ADMIN_USER_KEY = 'ia_collection_admin_user';

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly http = inject(HttpClient);
  private readonly token = signal<string | null>(this.readToken());
  private readonly adminName = signal<string | null>(this.readAdminName());

  readonly isAuthenticated = signal(Boolean(this.token()));
  readonly currentAdminName = this.adminName.asReadonly();

  login(payload: AdminLoginPayload): Observable<AdminLoginResponse> {
    return this.http.post<AdminLoginResponse>(`${API_BASE_URL}/admin/login`, payload).pipe(
      tap((response) => {
        localStorage.setItem(ADMIN_TOKEN_KEY, response.accessToken);
        localStorage.setItem(ADMIN_USER_KEY, response.admin.nome);
        this.token.set(response.accessToken);
        this.adminName.set(response.admin.nome);
        this.isAuthenticated.set(true);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    this.token.set(null);
    this.adminName.set(null);
    this.isAuthenticated.set(false);
  }

  getAccessToken(): string | null {
    return this.token();
  }

  private readToken(): string | null {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  }

  private readAdminName(): string | null {
    return localStorage.getItem(ADMIN_USER_KEY);
  }
}
