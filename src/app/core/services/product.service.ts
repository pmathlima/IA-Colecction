import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { PRODUCTS_DATA } from '../data/products.data';
import { Product, ProductCategory, ProductFilters } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly products = signal<Product[]>([]);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly allProducts = this.products.asReadonly();
  readonly featuredProducts = computed(() => this.products().filter((product) => product.destaque));
  readonly categories = computed<ProductCategory[]>(() => {
    const uniqueCategories = new Set(this.products().map((product) => product.categoria));
    return Array.from(uniqueCategories);
  });
  readonly highestPrice = computed(() => {
    const prices = this.products().map((product) => product.preco);
    return prices.length ? Math.ceil(Math.max(...prices)) : 0;
  });

  constructor() {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.http
      .get<Product[]>(`${API_BASE_URL}/products`)
      .pipe(
        catchError(() => {
          this.errorMessage.set('API indisponível. Usando dados locais de demonstração.');
          return of(PRODUCTS_DATA);
        }),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe((products) => this.products.set(products));
  }

  getProductById(id: number): Product | undefined {
    return this.products().find((product) => product.id === id);
  }

  filterProducts(filters: ProductFilters): Product[] {
    const normalizedTerm = filters.termo.trim().toLowerCase();
    const maxPrice = filters.precoMaximo > 0 ? filters.precoMaximo : this.highestPrice();

    return this.products().filter((product) => {
      const matchesTerm = product.nome.toLowerCase().includes(normalizedTerm);
      const matchesCategory = filters.categoria === 'Todas' || product.categoria === filters.categoria;
      const matchesPrice = maxPrice === 0 || product.preco <= maxPrice;

      return matchesTerm && matchesCategory && matchesPrice;
    });
  }
}
