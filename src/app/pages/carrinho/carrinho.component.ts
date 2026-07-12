import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartItem } from '../../core/models/cart-item.model';
import { CartService } from '../../core/services/cart.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { CartSummaryComponent } from '../../shared/components/cart-summary/cart-summary.component';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';
import { BrlCurrencyPipe } from '../../shared/pipes/brl-currency.pipe';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [RouterLink, CartSummaryComponent, UiButtonComponent, BrlCurrencyPipe, ImageUrlPipe],
  templateUrl: './carrinho.component.html',
  styleUrl: './carrinho.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarrinhoComponent {
  protected readonly cartService = inject(CartService);
  private readonly feedbackService = inject(FeedbackService);

  updateQuantity(item: CartItem, quantity: number): void {
    this.cartService.updateQuantity(item.produto.id, quantity, item.variacao?.id ?? null);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeProduct(item.produto.id, item.variacao?.id ?? null);
    this.feedbackService.show(`${item.produto.nome} removido do carrinho.`, 'info');
  }
}
