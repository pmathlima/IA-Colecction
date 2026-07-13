import { Injectable } from '@angular/core';

import { STORE_NAME, STORE_WHATSAPP_NUMBER } from '../config/store.config';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class WhatsappService {
  buildOrderConfirmationMessage(order: Order): string {
    const productLines = order.itens
      .map((item) => {
        const variation = [item.cor, item.tamanho].filter(Boolean).join(' / ');
        const variationText = variation ? ` | ${variation}` : '';
        return `- ${item.nome}${variationText} | Qtd: ${item.quantidade} | Subtotal: ${this.formatCurrency(item.subtotal)}`;
      })
      .join('\n');

    return [
      `Olá, ${STORE_NAME}!`,
      '',
      'Fiz um pedido pelo site e gostaria de confirmar minha compra.',
      '',
      `Pedido: ${order.id}`,
      `Nome: ${order.cliente.nome}`,
      `E-mail: ${order.cliente.email}`,
      `Telefone: ${order.cliente.telefone}`,
      `Pagamento: ${order.cliente.formaPagamento}`,
      '',
      'Produtos:',
      productLines,
      '',
      `Subtotal: ${this.formatCurrency(order.subtotal)}`,
      `Frete: ${this.formatCurrency(order.entrega.preco)} - ${order.entrega.nome}`,
      `Prazo: ${order.entrega.prazo}`,
      `Total: ${this.formatCurrency(order.total)}`,
      '',
      `Endereço: ${order.cliente.endereco}`,
    ].join('\n');
  }

  buildGeneralContactMessage(): string {
    return `Olá, ${STORE_NAME}! Gostaria de tirar uma dúvida sobre os produtos da loja.`;
  }

  buildOrderConfirmationUrl(order: Order): string {
    return this.buildWhatsappUrl(this.buildOrderConfirmationMessage(order));
  }

  buildGeneralContactUrl(): string {
    return this.buildWhatsappUrl(this.buildGeneralContactMessage());
  }

  openOrderConfirmation(order: Order): void {
    window.open(this.buildOrderConfirmationUrl(order), '_blank', 'noopener,noreferrer');
  }

  openGeneralContact(): void {
    window.open(this.buildGeneralContactUrl(), '_blank', 'noopener,noreferrer');
  }

  private buildWhatsappUrl(message: string): string {
    return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}
