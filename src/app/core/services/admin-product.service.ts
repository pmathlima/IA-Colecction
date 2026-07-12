import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { AdminImageUploadResponse, AdminImagesUploadResponse, AdminProductPayload, AdminProductResponse } from '../models/admin.model';
import { AdminAuthService } from './admin-auth.service';

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AdminAuthService);

  listProducts(): Observable<AdminProductResponse[]> {
    return this.http.get<AdminProductResponse[]>(`${API_BASE_URL}/admin/products`, {
      headers: this.authHeaders(),
    });
  }

  getProduct(id: number): Observable<AdminProductResponse> {
    return this.http.get<AdminProductResponse>(`${API_BASE_URL}/admin/products/${id}`, {
      headers: this.authHeaders(),
    });
  }

  createProduct(payload: AdminProductPayload): Observable<AdminProductResponse> {
    return this.http.post<AdminProductResponse>(`${API_BASE_URL}/admin/products`, payload, {
      headers: this.authHeaders(),
    });
  }

  updateProduct(id: number, payload: AdminProductPayload): Observable<AdminProductResponse> {
    return this.http.put<AdminProductResponse>(`${API_BASE_URL}/admin/products/${id}`, payload, {
      headers: this.authHeaders(),
    });
  }


  uploadProductImage(file: File): Observable<AdminImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<AdminImageUploadResponse>(`${API_BASE_URL}/admin/products/upload-image`, formData, {
      headers: this.authHeaders(),
    });
  }

  uploadProductImages(files: File[]): Observable<AdminImagesUploadResponse> {
    const formData = new FormData();

    files.forEach((file) => formData.append('files', file));

    return this.http.post<AdminImagesUploadResponse>(`${API_BASE_URL}/admin/products/upload-images`, formData, {
      headers: this.authHeaders(),
    });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/admin/products/${id}`, {
      headers: this.authHeaders(),
    });
  }

  private authHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }
}
