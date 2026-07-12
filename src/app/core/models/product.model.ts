export type ProductCategory =
  | 'Camisetas'
  | 'Moletons'
  | 'Acessórios'
  | 'Calçados'
  | 'Lançamentos'
  | 'Promoções';

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
