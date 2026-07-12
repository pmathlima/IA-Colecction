import { Product } from './product.model';

export interface CartItem {
  produto: Product;
  quantidade: number;
}
