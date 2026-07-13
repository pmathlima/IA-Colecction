import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";

import { CartItem } from "../../core/models/cart-item.model";
import { CartService } from "../../core/services/cart.service";
import { FeedbackService } from "../../core/services/feedback.service";
import { UiButtonComponent } from "../../shared/components/ui-button/ui-button.component";
import { BrlCurrencyPipe } from "../../shared/pipes/brl-currency.pipe";
import { ImageUrlPipe } from "../../shared/pipes/image-url.pipe";

@Component({
  selector: "app-carrinho",
  standalone: true,
  imports: [RouterLink, UiButtonComponent, BrlCurrencyPipe, ImageUrlPipe],
  templateUrl: "./carrinho.component.html",
  styleUrl: "./carrinho.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarrinhoComponent {
  protected readonly cartService = inject(CartService);
  private readonly feedbackService = inject(FeedbackService);

  decreaseQuantity(item: CartItem): void {
    const nextQuantity = item.quantidade - 1;

    if (nextQuantity < 1) {
      return;
    }

    this.updateQuantity(item, nextQuantity);
  }

  increaseQuantity(item: CartItem): void {
    const availableStock = this.availableStock(item);
    const nextQuantity = item.quantidade + 1;

    if (nextQuantity > availableStock) {
      this.feedbackService.show(
        "Quantidade máxima em estoque atingida.",
        "info",
      );
      return;
    }

    this.updateQuantity(item, nextQuantity);
  }

  updateQuantity(item: CartItem, quantity: number): void {
    const safeQuantity = Number.isFinite(quantity) ? quantity : 1;

    this.cartService.updateQuantity(
      item.produto.id,
      Math.max(1, safeQuantity),
      item.variacao?.id ?? null,
    );
  }

  removeItem(item: CartItem): void {
    this.cartService.removeProduct(item.produto.id, item.variacao?.id ?? null);
    this.feedbackService.show(
      `${item.produto.nome} removido do carrinho.`,
      "info",
    );
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.feedbackService.show("Carrinho esvaziado.", "info");
  }

  availableStock(item: CartItem): number {
    return this.cartService.getAvailableStock(item.produto, item.variacao);
  }

  itemImage(item: CartItem): string {
    return (
      item.produto.galeria?.find((image) => image.principal)?.url ??
      item.produto.imagem
    );
  }
}
