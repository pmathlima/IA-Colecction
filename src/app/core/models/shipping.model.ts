export type DeliveryMethod =
  | 'RETIRADA'
  | 'ENTREGA_LOCAL'
  | 'ENTREGA_METROPOLITANA'
  | 'ENTREGA_ESTADUAL'
  | 'ENTREGA_NACIONAL';

export interface ShippingAddress {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface DeliveryOption {
  metodo: DeliveryMethod;
  nome: string;
  preco: number;
  prazo: string;
  descricao: string;
}

export interface ShippingCalculateResponse {
  endereco: ShippingAddress;
  opcoes: DeliveryOption[];
}

export interface DeliverySelection {
  metodo: DeliveryMethod;
  nome: string;
  preco: number;
  prazo: string;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
}
