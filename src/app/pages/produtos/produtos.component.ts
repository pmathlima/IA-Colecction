import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';

import { ProductFilters } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductFiltersComponent } from '../../shared/components/product-filters/product-filters.component';

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [ProductCardComponent, ProductFiltersComponent],
  templateUrl: './produtos.component.html',
  styleUrl: './produtos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProdutosComponent {
  protected readonly productService = inject(ProductService);
  protected readonly filters = signal<ProductFilters>({
    termo: '',
    categoria: 'Todas',
    precoMaximo: 0,
  });

  protected readonly filteredProducts = computed(() => this.productService.filterProducts(this.filters()));

  private readonly syncHighestPrice = effect(() => {
    const highestPrice = this.productService.highestPrice();

    if (highestPrice > 0 && this.filters().precoMaximo === 0) {
      this.filters.update((currentFilters) => ({ ...currentFilters, precoMaximo: highestPrice }));
    }
  });

  updateFilters(filters: ProductFilters): void {
    this.filters.set(filters);
  }
}
