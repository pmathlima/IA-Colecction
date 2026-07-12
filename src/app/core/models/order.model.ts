export type PaymentMethod = 'Pix' | 'Cartão de Crédito' | 'Boleto Simulado';
export type OrderStatus = 'NOVO' | 'EM_ANALISE' | 'PAGO' | 'ENVIADO' | 'FINALIZADO' | 'CANCELADO' | 'CONFIRMADO';

export const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  'NOVO',
  'EM_ANALISE',
  'PAGO',
  'ENVIADO',
  'FINALIZADO',
  'CANCELADO',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NOVO: 'Novo',
  EM_ANALISE: 'Em análise',
  PAGO: 'Pago',
  ENVIADO: 'Enviado',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
  CONFIRMADO: 'Confirmado',
};

export interface CustomerData {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  formaPagamento: PaymentMethod;
}

export interface OrderItemResponse {
  produtoId: number;
  variacaoId?: number | null;
  nome: string;
  tamanho?: string | null;
  cor?: string | null;
  sku?: string | null;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
}

export interface Order {
  id: string;
  cliente: CustomerData;
  itens: OrderItemResponse[];
  total: number;
  status: OrderStatus;
  criadoEm: string;
}
