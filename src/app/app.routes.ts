import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'IA Collection | Home',
  },
  {
    path: 'produtos',
    loadComponent: () => import('./pages/produtos/produtos.component').then((m) => m.ProdutosComponent),
    title: 'IA Collection | Produtos',
  },
  {
    path: 'produtos/:id',
    loadComponent: () =>
      import('./pages/produto-detalhe/produto-detalhe.component').then((m) => m.ProdutoDetalheComponent),
    title: 'IA Collection | Detalhes do Produto',
  },
  {
    path: 'carrinho',
    loadComponent: () => import('./pages/carrinho/carrinho.component').then((m) => m.CarrinhoComponent),
    title: 'IA Collection | Carrinho',
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then((m) => m.CheckoutComponent),
    title: 'IA Collection | Checkout',
  },
  {
    path: 'sobre',
    loadComponent: () => import('./pages/sobre/sobre.component').then((m) => m.SobreComponent),
    title: 'IA Collection | Sobre',
  },
  {
    path: 'contato',
    loadComponent: () => import('./pages/contato/contato.component').then((m) => m.ContatoComponent),
    title: 'IA Collection | Contato',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
