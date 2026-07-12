import { Product, ProductVariation } from './product.model';

export interface CartItem {
  produto: Product;
  quantidade: number;
  variacao?: ProductVariation | null;
}
