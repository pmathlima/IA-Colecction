import { Routes } from '@angular/router';

import { adminAuthGuard } from './core/guards/admin-auth.guard';
import { customerAuthGuard } from './core/guards/customer-auth.guard';

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
    path: 'pedido-confirmado',
    loadComponent: () =>
      import('./pages/pedido-confirmado/pedido-confirmado.component').then((m) => m.PedidoConfirmadoComponent),
    title: 'IA Collection | Pedido Confirmado',
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
    path: 'login',
    loadComponent: () => import('./pages/auth-login/auth-login.component').then((m) => m.AuthLoginComponent),
    title: 'IA Collection | Login da Cliente',
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./pages/auth-cadastro/auth-cadastro.component').then((m) => m.AuthCadastroComponent),
    title: 'IA Collection | Cadastro da Cliente',
  },
  {
    path: 'minha-conta',
    canActivate: [customerAuthGuard],
    loadComponent: () => import('./pages/minha-conta/minha-conta.component').then((m) => m.MinhaContaComponent),
    title: 'IA Collection | Minha Conta',
  },
  {
    path: 'meus-pedidos',
    canActivate: [customerAuthGuard],
    loadComponent: () => import('./pages/meus-pedidos/meus-pedidos.component').then((m) => m.MeusPedidosComponent),
    title: 'IA Collection | Meus Pedidos',
  },
  {
    path: 'meus-pedidos/:id',
    canActivate: [customerAuthGuard],
    loadComponent: () =>
      import('./pages/meu-pedido-detalhe/meu-pedido-detalhe.component').then((m) => m.MeuPedidoDetalheComponent),
    title: 'IA Collection | Detalhe do Pedido',
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
    path: 'admin/mensagens',
    canActivate: [adminAuthGuard],
    loadComponent: () => import('./pages/admin-mensagens/admin-mensagens.component').then((m) => m.AdminMensagensComponent),
    title: 'IA Collection | Admin Mensagens',
  },
  {
    path: 'admin/mensagens/:id',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./pages/admin-mensagem-detalhe/admin-mensagem-detalhe.component').then((m) => m.AdminMensagemDetalheComponent),
    title: 'IA Collection | Detalhes da Mensagem',
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
