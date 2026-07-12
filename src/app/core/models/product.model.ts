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

export interface ProductImage {
  id: number | null;
  url: string;
  alt: string;
  principal: boolean;
  ordem: number;
}

export interface ProductVariation {
  id: number | null;
  tamanho: string;
  cor: string;
  estoque: number;
  sku?: string | null;
  ativo: boolean;
}

export interface Product {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  categoria: ProductCategory;
  imagem: string;
  imagens: string[];
  galeria: ProductImage[];
  estoque: number;
  destaque: boolean;
  dataCriacao: string;
  variacoes: ProductVariation[];
}

export interface ProductFilters {
  termo: string;
  categoria: ProductCategory | 'Todas';
  precoMaximo: number;
}
