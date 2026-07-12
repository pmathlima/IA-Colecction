import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

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

  private readonly cartService = inject(CartService);
  private readonly feedbackService = inject(FeedbackService);

  addToCart(): void {
    this.cartService.addProduct(this.product());
    this.feedbackService.show(`${this.product().nome} adicionado ao carrinho.`, 'success');
  }
}
