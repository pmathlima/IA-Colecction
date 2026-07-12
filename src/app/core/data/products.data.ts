import { Product } from '../models/product.model';

export const PRODUCTS_DATA: Product[] = [
  {
    id: 1,
    nome: 'Camiseta Neural Black',
    descricao:
      'Camiseta premium preta com estampa minimalista inspirada em inteligência artificial. Tecido confortável, corte moderno e acabamento reforçado.',
    preco: 89.9,
    categoria: 'Camisetas',
    imagem: 'assets/products/camiseta-neural.svg',
    estoque: 28,
    destaque: true,
    dataCriacao: '2026-07-01T10:00:00.000Z',
  },
  {
    id: 2,
    nome: 'Moletom Quantum Purple',
    descricao:
      'Moletom oversized com visual tecnológico, capuz estruturado e toque macio. Ideal para compor looks urbanos e elegantes.',
    preco: 199.9,
    categoria: 'Moletons',
    imagem: 'assets/products/moletom-quantum.svg',
    estoque: 14,
    destaque: true,
    dataCriacao: '2026-07-02T10:00:00.000Z',
  },
  {
    id: 3,
    nome: 'Boné IA Signature',
    descricao:
      'Boné preto com bordado IA Colecction em acabamento premium. Aba curva, regulagem traseira e visual sofisticado.',
    preco: 79.9,
    categoria: 'Acessórios',
    imagem: 'assets/products/bone-signature.svg',
    estoque: 34,
    destaque: false,
    dataCriacao: '2026-07-03T10:00:00.000Z',
  },
  {
    id: 4,
    nome: 'Tênis Future Step',
    descricao:
      'Tênis casual com design futurista, solado confortável e detalhes em azul elétrico. Feito para uso diário com estilo.',
    preco: 289.9,
    categoria: 'Calçados',
    imagem: 'assets/products/tenis-future.svg',
    estoque: 9,
    destaque: true,
    dataCriacao: '2026-07-04T10:00:00.000Z',
  },
  {
    id: 5,
    nome: 'Camiseta Code White',
    descricao:
      'Camiseta branca de algodão com detalhe gráfico discreto. Visual limpo, versátil e perfeito para combinações casuais.',
    preco: 84.9,
    categoria: 'Camisetas',
    imagem: 'assets/products/camiseta-code.svg',
    estoque: 22,
    destaque: false,
    dataCriacao: '2026-07-05T10:00:00.000Z',
  },
  {
    id: 6,
    nome: 'Shoulder Bag Tech Gold',
    descricao:
      'Bolsa transversal compacta com compartimentos internos, detalhe dourado e acabamento resistente para rotina urbana.',
    preco: 119.9,
    categoria: 'Acessórios',
    imagem: 'assets/products/shoulder-tech.svg',
    estoque: 16,
    destaque: true,
    dataCriacao: '2026-07-06T10:00:00.000Z',
  },
  {
    id: 7,
    nome: 'Moletom Minimal Grey',
    descricao:
      'Moletom cinza minimalista com etiqueta premium IA Colecction. Confortável, elegante e fácil de combinar.',
    preco: 179.9,
    categoria: 'Promoções',
    imagem: 'assets/products/moletom-grey.svg',
    estoque: 7,
    destaque: false,
    dataCriacao: '2026-07-07T10:00:00.000Z',
  },
  {
    id: 8,
    nome: 'Jaqueta Launch Edition',
    descricao:
      'Jaqueta leve de lançamento com recortes modernos, acabamento premium e identidade tecnológica exclusiva da marca.',
    preco: 349.9,
    categoria: 'Lançamentos',
    imagem: 'assets/products/jaqueta-launch.svg',
    estoque: 6,
    destaque: true,
    dataCriacao: '2026-07-08T10:00:00.000Z',
  },
];
