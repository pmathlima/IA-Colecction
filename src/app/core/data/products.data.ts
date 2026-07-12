import { Product } from '../models/product.model';

export const PRODUCTS_DATA: Product[] = [
  {
    id: 1,
    nome: 'Vestido Aurora Vinho',
    descricao:
      'Vestido feminino midi em tom vinho, com caimento elegante, toque macio e acabamento sofisticado para ocasiões especiais.',
    preco: 189.9,
    categoria: 'Vestidos',
    imagem: 'assets/products/vestido-aurora.svg',
    estoque: 18,
    destaque: true,
    dataCriacao: '2026-07-01T10:00:00.000Z',
  },
  {
    id: 2,
    nome: 'Blusa Marfim Elegance',
    descricao:
      'Blusa feminina em tecido leve na cor marfim, com modelagem delicada e versátil para composições casuais ou refinadas.',
    preco: 99.9,
    categoria: 'Blusas',
    imagem: 'assets/products/blusa-marfim.svg',
    estoque: 26,
    destaque: true,
    dataCriacao: '2026-07-02T10:00:00.000Z',
  },
  {
    id: 3,
    nome: 'Conjunto Lívia Premium',
    descricao:
      'Conjunto feminino sofisticado com blusa e saia em tons neutros, pensado para looks modernos, confortáveis e elegantes.',
    preco: 259.9,
    categoria: 'Conjuntos',
    imagem: 'assets/products/conjunto-livia.svg',
    estoque: 12,
    destaque: true,
    dataCriacao: '2026-07-03T10:00:00.000Z',
  },
  {
    id: 4,
    nome: 'Saia Midi Bella',
    descricao:
      'Saia midi com cintura alta, movimento leve e acabamento premium. Uma peça versátil para produções femininas elegantes.',
    preco: 139.9,
    categoria: 'Saias',
    imagem: 'assets/products/saia-bella.svg',
    estoque: 20,
    destaque: false,
    dataCriacao: '2026-07-04T10:00:00.000Z',
  },
  {
    id: 5,
    nome: 'Sandália Valentina Gold',
    descricao:
      'Sandália feminina com detalhe dourado suave, design delicado e confortável para completar looks casuais ou sociais.',
    preco: 179.9,
    categoria: 'Calçados',
    imagem: 'assets/products/sandalia-valentina.svg',
    estoque: 10,
    destaque: true,
    dataCriacao: '2026-07-05T10:00:00.000Z',
  },
  {
    id: 6,
    nome: 'Bolsa Grace Vinho',
    descricao:
      'Bolsa feminina compacta em tom vinho, com alça elegante, espaço interno funcional e acabamento sofisticado.',
    preco: 159.9,
    categoria: 'Acessórios',
    imagem: 'assets/products/bolsa-grace.svg',
    estoque: 16,
    destaque: false,
    dataCriacao: '2026-07-06T10:00:00.000Z',
  },
  {
    id: 7,
    nome: 'Vestido Flora Lançamento',
    descricao:
      'Vestido lançamento com visual delicado, detalhes femininos e proposta elegante para mulheres que valorizam presença e estilo.',
    preco: 219.9,
    categoria: 'Lançamentos',
    imagem: 'assets/products/vestido-flora.svg',
    estoque: 8,
    destaque: true,
    dataCriacao: '2026-07-07T10:00:00.000Z',
  },
  {
    id: 8,
    nome: 'Cinto Laço Sofisticado',
    descricao:
      'Acessório feminino em promoção, com detalhe em laço e acabamento delicado para valorizar vestidos, saias e conjuntos.',
    preco: 69.9,
    categoria: 'Promoções',
    imagem: 'assets/products/cinto-laco.svg',
    estoque: 30,
    destaque: false,
    dataCriacao: '2026-07-08T10:00:00.000Z',
  },
];
