import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

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

  selectImage(imageUrl: string): void {
    this.selectedImage.set(imageUrl);
  }

  addToCart(): void {
    const product = this.product();

    if (!product) {
      return;
    }

    this.cartService.addProduct(product);
    this.feedbackService.show(`${product.nome} adicionado ao carrinho.`, 'success');
  }
}
