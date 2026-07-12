import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ProductVariation } from '../../core/models/product.model';
import { CartService } from '../../core/services/cart.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { ProductService } from '../../core/services/product.service';
import { CategoryBadgeComponent } from '../../shared/components/category-badge/category-badge.component';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';
import { BrlCurrencyPipe } from '../../shared/pipes/brl-currency.pipe';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-produto-detalhe',
  standalone: true,
  imports: [RouterLink, BrlCurrencyPipe, ImageUrlPipe, CategoryBadgeComponent, UiButtonComponent],
  templateUrl: './produto-detalhe.component.html',
  styleUrl: './produto-detalhe.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProdutoDetalheComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly feedbackService = inject(FeedbackService);

  protected readonly selectedImage = signal<string | null>(null);
  protected readonly selectedColor = signal<string | null>(null);
  protected readonly selectedSize = signal<string | null>(null);

  protected readonly product = computed(() => {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    return this.productService.getProductById(id);
  });

  protected readonly galleryImages = computed(() => {
    const product = this.product();

    if (!product) {
      return [];
    }

    return product.imagens?.length ? product.imagens : [product.imagem];
  });

  protected readonly activeImage = computed(() => this.selectedImage() || this.galleryImages()[0] || '');

  protected readonly activeVariations = computed(() =>
    (this.product()?.variacoes ?? []).filter((variation) => variation.ativo),
  );

  protected readonly hasVariations = computed(() => this.activeVariations().length > 0);

  protected readonly availableColors = computed(() => {
    const colors = new Set(this.activeVariations().map((variation) => variation.cor));
    return Array.from(colors);
  });

  protected readonly availableSizes = computed(() => {
    const color = this.selectedColor();
    const variations = color
      ? this.activeVariations().filter((variation) => variation.cor === color)
      : this.activeVariations();
    const sizes = new Set(variations.map((variation) => variation.tamanho));
    return Array.from(sizes);
  });

  protected readonly selectedVariation = computed<ProductVariation | null>(() => {
    const color = this.selectedColor();
    const size = this.selectedSize();

    if (!color || !size) {
      return null;
    }

    return this.activeVariations().find((variation) => variation.cor === color && variation.tamanho === size) ?? null;
  });

  protected readonly availableStock = computed(() => {
    if (this.hasVariations()) {
      return this.selectedVariation()?.estoque ?? 0;
    }

    return this.product()?.estoque ?? 0;
  });

  protected readonly canAddToCart = computed(() => {
    if (!this.product()) {
      return false;
    }

    if (this.hasVariations()) {
      return !!this.selectedVariation() && this.availableStock() > 0;
    }

    return this.availableStock() > 0;
  });

  selectImage(imageUrl: string): void {
    this.selectedImage.set(imageUrl);
  }

  selectColor(color: string): void {
    this.selectedColor.set(color);
    this.selectedSize.set(null);
  }

  selectSize(size: string): void {
    this.selectedSize.set(size);
  }

  isSizeAvailable(size: string): boolean {
    const color = this.selectedColor();

    return this.activeVariations().some(
      (variation) => variation.tamanho === size && (!color || variation.cor === color) && variation.estoque > 0,
    );
  }

  addToCart(): void {
    const product = this.product();

    if (!product) {
      return;
    }

    if (this.hasVariations() && !this.selectedVariation()) {
      this.feedbackService.show('Selecione cor e tamanho antes de adicionar ao carrinho.', 'error');
      return;
    }

    if (this.availableStock() <= 0) {
      this.feedbackService.show('Essa variação está indisponível no momento.', 'error');
      return;
    }

    const variation = this.selectedVariation();
    this.cartService.addProduct(product, 1, variation);
    this.feedbackService.show(
      variation
        ? `${product.nome} (${variation.cor} / ${variation.tamanho}) adicionado ao carrinho.`
        : `${product.nome} adicionado ao carrinho.`,
      'success',
    );
  }
}
