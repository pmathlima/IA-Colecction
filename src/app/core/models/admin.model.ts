import { Product, ProductCategory } from './product.model';

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  tokenType: 'bearer';
  admin: {
    email: string;
    nome: string;
  };
}

export interface AdminProductPayload {
  nome: string;
  descricao: string;
  preco: number;
  categoria: ProductCategory;
  imagem: string;
  estoque: number;
  destaque: boolean;
}

export type AdminProductResponse = Product;
