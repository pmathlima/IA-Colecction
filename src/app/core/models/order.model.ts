export type PaymentMethod = 'Pix' | 'Cartão de Crédito' | 'Boleto Simulado';

export interface CustomerData {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  formaPagamento: PaymentMethod;
}

export interface OrderItemResponse {
  produtoId: number;
  nome: string;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
}

export interface Order {
  id: string;
  cliente: CustomerData;
  itens: OrderItemResponse[];
  total: number;
  status: string;
  criadoEm: string;
}
