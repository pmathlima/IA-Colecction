import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";

import { Product, ProductFilters } from "../../core/models/product.model";
import { ProductService } from "../../core/services/product.service";
import { ProductCardComponent } from "../../shared/components/product-card/product-card.component";
import { ProductFiltersComponent } from "../../shared/components/product-filters/product-filters.component";

type SortOption = "novidades" | "menor-preco" | "maior-preco" | "nome";

@Component({
  selector: "app-produtos",
  standalone: true,
  imports: [ProductCardComponent, ProductFiltersComponent],
  templateUrl: "./produtos.component.html",
  styleUrl: "./produtos.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProdutosComponent {
  protected readonly productService = inject(ProductService);

  protected readonly filters = signal<ProductFilters>({
    termo: "",
    categoria: "Todas",
    precoMaximo: 0,
  });

  protected readonly sortOption = signal<SortOption>("novidades");

  protected readonly filteredProducts = computed(() => {
    return this.productService.filterProducts(this.filters());
  });

  protected readonly visibleProducts = computed(() => {
    const products = [...this.filteredProducts()];
    const selectedSort = this.sortOption();

    if (selectedSort === "menor-preco") {
      return products.sort((a, b) => a.preco - b.preco);
    }

    if (selectedSort === "maior-preco") {
      return products.sort((a, b) => b.preco - a.preco);
    }

    if (selectedSort === "nome") {
      return products.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    return products.sort((a, b) => this.compareByDate(b, a));
  });

  protected readonly hasActiveFilters = computed(() => {
    const currentFilters = this.filters();
    const highestPrice = this.productService.highestPrice();

    return (
      currentFilters.termo.trim().length > 0 ||
      currentFilters.categoria !== "Todas" ||
      (highestPrice > 0 && currentFilters.precoMaximo < highestPrice)
    );
  });

  private readonly syncHighestPrice = effect(() => {
    const highestPrice = this.productService.highestPrice();

    if (highestPrice > 0 && this.filters().precoMaximo === 0) {
      this.filters.update((currentFilters) => ({
        ...currentFilters,
        precoMaximo: highestPrice,
      }));
    }
  });

  updateFilters(filters: ProductFilters): void {
    this.filters.set(filters);
  }

  updateSort(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortOption.set(target.value as SortOption);
  }

  clearFilters(): void {
    this.filters.set({
      termo: "",
      categoria: "Todas",
      precoMaximo: this.productService.highestPrice(),
    });

    this.sortOption.set("novidades");
  }

  private compareByDate(firstProduct: Product, secondProduct: Product): number {
    const firstDate = new Date(firstProduct.dataCriacao).getTime();
    const secondDate = new Date(secondProduct.dataCriacao).getTime();

    return (firstDate || 0) - (secondDate || 0);
  }
}
