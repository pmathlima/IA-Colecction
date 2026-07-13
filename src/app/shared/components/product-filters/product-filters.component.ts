import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { FormsModule } from "@angular/forms";

import {
  ProductCategory,
  ProductFilters,
} from "../../../core/models/product.model";
import { BrlCurrencyPipe } from "../../pipes/brl-currency.pipe";
import { SearchInputComponent } from "../search-input/search-input.component";

@Component({
  selector: "app-product-filters",
  standalone: true,
  imports: [FormsModule, BrlCurrencyPipe, SearchInputComponent],
  templateUrl: "./product-filters.component.html",
  styleUrl: "./product-filters.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFiltersComponent {
  readonly filters = input.required<ProductFilters>();
  readonly categories = input.required<ProductCategory[]>();
  readonly highestPrice = input.required<number>();
  readonly filtersChange = output<ProductFilters>();

  updateTerm(termo: string): void {
    this.emit({
      ...this.filters(),
      termo,
    });
  }

  updateCategory(categoria: ProductCategory | "Todas"): void {
    this.emit({
      ...this.filters(),
      categoria,
    });
  }

  updatePrice(precoMaximo: number): void {
    this.emit({
      ...this.filters(),
      precoMaximo,
    });
  }

  resetFilters(): void {
    this.emit({
      termo: "",
      categoria: "Todas",
      precoMaximo: this.highestPrice(),
    });
  }

  private emit(filters: ProductFilters): void {
    this.filtersChange.emit(filters);
  }
}
