import { Injectable, computed, signal } from '@angular/core';

import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';

const CART_STORAGE_KEY = 'ia-collection-cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly itemsState = signal<CartItem[]>(this.restoreCart());

  readonly items = this.itemsState.asReadonly();
  readonly totalItems = computed(() => this.items().reduce((total, item) => total + item.quantidade, 0));
  readonly totalPrice = computed(() => this.items().reduce((total, item) => total + item.produto.preco * item.quantidade, 0));
  readonly isEmpty = computed(() => this.items().length === 0);

  addProduct(product: Product, quantity = 1): void {
    const currentItems = this.items();
    const existingItem = currentItems.find((item) => item.produto.id === product.id);

    if (existingItem) {
      this.itemsState.set(
        currentItems.map((item) =>
          item.produto.id === product.id
            ? { ...item, quantidade: Math.min(item.quantidade + quantity, product.estoque) }
            : item,
        ),
      );
    } else {
      this.itemsState.set([...currentItems, { produto: product, quantidade: Math.min(quantity, product.estoque) }]);
    }

    this.persistCart();
  }

  removeProduct(productId: number): void {
    this.itemsState.set(this.items().filter((item) => item.produto.id !== productId));
    this.persistCart();
  }

  updateQuantity(productId: number, quantity: number): void {
    this.itemsState.set(
      this.items().map((item) => {
        if (item.produto.id !== productId) {
          return item;
        }

        const safeQuantity = Math.max(1, Math.min(quantity, item.produto.estoque));
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
