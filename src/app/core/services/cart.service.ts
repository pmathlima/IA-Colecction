import { Injectable, computed, signal } from '@angular/core';

import { CartItem } from '../models/cart-item.model';
import { Product, ProductVariation } from '../models/product.model';

const CART_STORAGE_KEY = 'ia-collection-cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsState = signal<CartItem[]>(this.restoreCart());

  readonly items = this.itemsState.asReadonly();
  readonly totalItems = computed(() => this.items().reduce((total, item) => total + item.quantidade, 0));
  readonly totalPrice = computed(() => this.items().reduce((total, item) => total + item.produto.preco * item.quantidade, 0));
  readonly isEmpty = computed(() => this.items().length === 0);

  addProduct(product: Product, quantity = 1, variation?: ProductVariation | null): void {
    const currentItems = this.items();
    const stock = this.getAvailableStock(product, variation);
    const existingItem = currentItems.find((item) => this.sameItem(item, product.id, variation?.id ?? null));

    if (stock <= 0) {
      return;
    }

    if (existingItem) {
      this.itemsState.set(
        currentItems.map((item) =>
          this.sameItem(item, product.id, variation?.id ?? null)
            ? { ...item, quantidade: Math.min(item.quantidade + quantity, stock) }
            : item,
        ),
      );
    } else {
      this.itemsState.set([...currentItems, { produto: product, variacao: variation ?? null, quantidade: Math.min(quantity, stock) }]);
    }

    this.persistCart();
  }

  removeProduct(productId: number, variationId: number | null = null): void {
    this.itemsState.set(this.items().filter((item) => !this.sameItem(item, productId, variationId)));
    this.persistCart();
  }

  updateQuantity(productId: number, quantity: number, variationId: number | null = null): void {
    this.itemsState.set(
      this.items().map((item) => {
        if (!this.sameItem(item, productId, variationId)) {
          return item;
        }

        const safeQuantity = Math.max(1, Math.min(quantity, this.getAvailableStock(item.produto, item.variacao)));
        return { ...item, quantidade: safeQuantity };
      }),
    );

    this.persistCart();
  }

  clearCart(): void {
    this.itemsState.set([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }

  getSubtotal(item: CartItem): number {
    return item.produto.preco * item.quantidade;
  }

  getAvailableStock(product: Product, variation?: ProductVariation | null): number {
    return variation ? variation.estoque : product.estoque;
  }

  itemKey(item: CartItem): string {
    return `${item.produto.id}-${item.variacao?.id ?? 'sem-variacao'}`;
  }

  variationLabel(item: CartItem): string | null {
    if (!item.variacao) {
      return null;
    }

    return `${item.variacao.cor} / ${item.variacao.tamanho}`;
  }

  private sameItem(item: CartItem, productId: number, variationId: number | null): boolean {
    return item.produto.id === productId && (item.variacao?.id ?? null) === variationId;
  }

  private persistCart(): void {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items()));
  }

  private restoreCart(): CartItem[] {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!storedCart) {
      return [];
    }

    try {
      return JSON.parse(storedCart) as CartItem[];
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }
  }
}
