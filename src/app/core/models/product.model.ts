export const PRODUCT_CATEGORIES = [
  'Vestidos',
  'Blusas',
  'Conjuntos',
  'Saias',
  'Calçados',
  'Acessórios',
  'Lançamentos',
  'Promoções',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface Product {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: ProductCategory;
  imagem: string;
  estoque: number;
  destaque: boolean;
  dataCriacao: string;
}

export interface ProductFilters {
  termo: string;
  categoria: ProductCategory | 'Todas';
  precoMaximo: number;
}
