import { ContactResponse } from './contact.model';
import { Order } from './order.model';

export interface AdminDashboardSalesPoint {
  date: string;
  label: string;
  total: number;
}

export interface AdminDashboardStatusItem {
  status: string;
  label: string;
  total: number;
}

export interface AdminDashboardLowStockProduct {
  id: number;
  nome: string;
  categoria: string;
  estoque: number;
  imagem: string;
}

export interface AdminDashboardResponse {
  totalProdutos: number;
  produtosEstoqueBaixo: number;
  totalPedidos: number;
  pedidosNovos: number;
  pedidosPagos: number;
  pedidosEnviados: number;
  totalVendido: number;
  mensagensNovas: number;
  clientesCadastradas: number;
  vendasUltimosSeteDias: AdminDashboardSalesPoint[];
  statusPedidos: AdminDashboardStatusItem[];
  ultimosPedidos: Order[];
  ultimasMensagens: ContactResponse[];
  produtosBaixoEstoque: AdminDashboardLowStockProduct[];
}
