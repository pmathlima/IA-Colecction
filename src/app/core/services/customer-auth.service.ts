import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import {
  Customer,
  CustomerLoginPayload,
  CustomerLoginResponse,
  CustomerRegisterPayload,
  CustomerUpdatePayload,
} from '../models/customer.model';

const CUSTOMER_TOKEN_KEY = 'ia_collection_customer_token';
const CUSTOMER_USER_KEY = 'ia_collection_customer_user';

@Injectable({ providedIn: 'root' })
export class CustomerAuthService {
  private readonly http = inject(HttpClient);
  private readonly token = signal<string | null>(this.readToken());
  private readonly customer = signal<Customer | null>(this.readCustomer());

  readonly isAuthenticated = signal(Boolean(this.token()));
  readonly currentCustomer = this.customer.asReadonly();

  register(payload: CustomerRegisterPayload): Observable<CustomerLoginResponse> {
    return this.http.post<CustomerLoginResponse>(`${API_BASE_URL}/auth/register`, payload).pipe(
      tap((response) => this.persistSession(response)),
    );
  }

  login(payload: CustomerLoginPayload): Observable<CustomerLoginResponse> {
    return this.http.post<CustomerLoginResponse>(`${API_BASE_URL}/auth/login`, payload).pipe(
      tap((response) => this.persistSession(response)),
    );
  }

  loadProfile(): Observable<Customer> {
    return this.http.get<Customer>(`${API_BASE_URL}/customer/me`, { headers: this.authHeaders() }).pipe(
      tap((customer) => this.setCustomer(customer)),
    );
  }

  updateProfile(payload: CustomerUpdatePayload): Observable<Customer> {
    return this.http.put<Customer>(`${API_BASE_URL}/customer/me`, payload, { headers: this.authHeaders() }).pipe(
      tap((customer) => this.setCustomer(customer)),
    );
  }

  logout(): void {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_USER_KEY);
    this.token.set(null);
    this.customer.set(null);
    this.isAuthenticated.set(false);
  }

  getAccessToken(): string | null {
    return this.token();
  }

  authHeaders(): HttpHeaders {
    const accessToken = this.getAccessToken();
    return accessToken ? new HttpHeaders({ Authorization: `Bearer ${accessToken}` }) : new HttpHeaders();
  }

  private persistSession(response: CustomerLoginResponse): void {
    localStorage.setItem(CUSTOMER_TOKEN_KEY, response.accessToken);
    this.token.set(response.accessToken);
    this.setCustomer(response.cliente);
    this.isAuthenticated.set(true);
  }

  private setCustomer(customer: Customer): void {
    localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(customer));
    this.customer.set(customer);
  }

  private readToken(): string | null {
    return localStorage.getItem(CUSTOMER_TOKEN_KEY);
  }

  private readCustomer(): Customer | null {
    const raw = localStorage.getItem(CUSTOMER_USER_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as Customer;
    } catch {
      localStorage.removeItem(CUSTOMER_USER_KEY);
      return null;
    }
  }
}
