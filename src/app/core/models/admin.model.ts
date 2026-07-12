import { Product, ProductCategory, ProductVariation } from './product.model';

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
  imagens: string[];
  estoque: number;
  destaque: boolean;
  variacoes: ProductVariation[];
}

export type AdminProductResponse = Product;

export interface AdminImageUploadResponse {
  url: string;
  filename: string;
}

export interface AdminImagesUploadResponse {
  images: AdminImageUploadResponse[];
}
