import { Order } from './order.model';

export interface Customer {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  criadoEm: string;
}

export interface CustomerRegisterPayload {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  password: string;
}

export interface CustomerLoginPayload {
  email: string;
  password: string;
}

export interface CustomerUpdatePayload {
  nome?: string;
  telefone?: string;
  endereco?: string;
}

export interface CustomerLoginResponse {
  accessToken: string;
  tokenType: 'bearer';
  cliente: Customer;
}

export type CustomerOrder = Order;
