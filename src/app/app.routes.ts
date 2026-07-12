import { Routes } from '@angular/router';

import { adminAuthGuard } from './core/guards/admin-auth.guard';

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
    path: 'admin/login',
    loadComponent: () => import('./pages/admin-login/admin-login.component').then((m) => m.AdminLoginComponent),
    title: 'IA Collection | Login Admin',
  },
  {
    path: 'admin/produtos',
    canActivate: [adminAuthGuard],
    loadComponent: () => import('./pages/admin-produtos/admin-produtos.component').then((m) => m.AdminProdutosComponent),
    title: 'IA Collection | Admin Produtos',
  },
  {
    path: 'admin/produtos/novo',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./pages/admin-produto-form/admin-produto-form.component').then((m) => m.AdminProdutoFormComponent),
    title: 'IA Collection | Novo Produto',
  },
  {
    path: 'admin/produtos/:id/editar',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./pages/admin-produto-form/admin-produto-form.component').then((m) => m.AdminProdutoFormComponent),
    title: 'IA Collection | Editar Produto',
  },
  {
    path: 'admin/pedidos',
    canActivate: [adminAuthGuard],
    loadComponent: () => import('./pages/admin-pedidos/admin-pedidos.component').then((m) => m.AdminPedidosComponent),
    title: 'IA Collection | Admin Pedidos',
  },
  {
    path: 'admin/pedidos/:id',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./pages/admin-pedido-detalhe/admin-pedido-detalhe.component').then((m) => m.AdminPedidoDetalheComponent),
    title: 'IA Collection | Detalhes do Pedido',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
