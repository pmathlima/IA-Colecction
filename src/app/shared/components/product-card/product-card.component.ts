import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { FeedbackService } from '../../../core/services/feedback.service';
import { BrlCurrencyPipe } from '../../pipes/brl-currency.pipe';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';
import { CategoryBadgeComponent } from '../category-badge/category-badge.component';
import { UiButtonComponent } from '../ui-button/ui-button.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, BrlCurrencyPipe, ImageUrlPipe, CategoryBadgeComponent, UiButtonComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly hasVariations = computed(() => (this.product().variacoes ?? []).some((variation) => variation.ativo));

  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);
  private readonly feedbackService = inject(FeedbackService);

  addToCart(): void {
    if (this.hasVariations()) {
      this.feedbackService.show('Escolha cor e tamanho na página de detalhes.', 'info');
      void this.router.navigate(['/produtos', this.product().id]);
      return;
    }

    this.cartService.addProduct(this.product());
    this.feedbackService.show(`${this.product().nome} adicionado ao carrinho.`, 'success');
  }
}
