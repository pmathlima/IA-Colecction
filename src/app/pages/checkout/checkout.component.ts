import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CustomerData, Order, PaymentMethod } from '../../core/models/order.model';
import { DeliveryMethod, DeliveryOption, DeliverySelection } from '../../core/models/shipping.model';
import { CartService } from '../../core/services/cart.service';
import { CheckoutService } from '../../core/services/checkout.service';
import { CustomerAuthService } from '../../core/services/customer-auth.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { ShippingService } from '../../core/services/shipping.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';
import { BrlCurrencyPipe } from '../../shared/pipes/brl-currency.pipe';

const LAST_ORDER_STORAGE_KEY = 'ia-collection-last-order';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, UiButtonComponent, BrlCurrencyPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent implements OnInit {
  protected readonly cartService = inject(CartService);
  protected readonly isSubmitting = signal(false);
  protected readonly isCalculatingShipping = signal(false);
  protected readonly shippingOptions = signal<DeliveryOption[]>([]);
  protected readonly selectedShipping = signal<DeliveryOption | null>(null);
  protected readonly shippingError = signal('');
  protected readonly orderTotal = computed(() => this.cartService.totalPrice() + (this.selectedShipping()?.preco ?? 0));

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly checkoutService = inject(CheckoutService);
  private readonly shippingService = inject(ShippingService);
  protected readonly customerAuthService = inject(CustomerAuthService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly router = inject(Router);

  protected readonly checkoutForm = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', [Validators.required, Validators.minLength(10)]],
    cep: ['', [Validators.required, Validators.minLength(8)]],
    endereco: ['', [Validators.required, Validators.minLength(3)]],
    numero: ['', [Validators.required, Validators.minLength(1)]],
    complemento: [''],
    bairro: ['', [Validators.required, Validators.minLength(2)]],
    cidade: ['', [Validators.required, Validators.minLength(2)]],
    estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    formaEntrega: ['' as DeliveryMethod | '', Validators.required],
    formaPagamento: ['Pix' as PaymentMethod, Validators.required],
  });

  ngOnInit(): void {
    const customer = this.customerAuthService.currentCustomer();
    if (!customer) {
      return;
    }

    this.checkoutForm.patchValue({
      nome: customer.nome,
      email: customer.email,
      telefone: customer.telefone,
    });
  }

  calculateShipping(): void {
    const cep = this.checkoutForm.controls.cep.value;

    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      this.feedbackService.show('Informe um CEP válido com 8 dígitos.', 'error');
      this.checkoutForm.controls.cep.markAsTouched();
      return;
    }

    this.isCalculatingShipping.set(true);
    this.shippingError.set('');
    this.shippingOptions.set([]);
    this.selectedShipping.set(null);
    this.checkoutForm.patchValue({ formaEntrega: '' });

    this.shippingService
      .calculateShipping(cep, this.cartService.totalPrice())
      .pipe(finalize(() => this.isCalculatingShipping.set(false)))
      .subscribe({
        next: (response) => {
          this.checkoutForm.patchValue({
            cep: response.endereco.cep,
            endereco: response.endereco.logradouro,
            bairro: response.endereco.bairro,
            cidade: response.endereco.cidade,
            estado: response.endereco.estado,
          });

          this.shippingOptions.set(response.opcoes);
          const preferredDelivery = response.opcoes.find((option) => option.metodo !== 'RETIRADA') ?? response.opcoes[0];
          this.selectShipping(preferredDelivery.metodo);
          this.feedbackService.show('CEP consultado e opções de entrega atualizadas.', 'success');
        },
        error: (error) => {
          const message = error?.error?.detail ?? 'Não foi possível consultar o CEP. Tente novamente.';
          this.shippingError.set(message);
          this.feedbackService.show(message, 'error');
        },
      });
  }

  selectShipping(method: DeliveryMethod | ''): void {
    const option = this.shippingOptions().find((shippingOption) => shippingOption.metodo === method) ?? null;
    this.selectedShipping.set(option);
    this.checkoutForm.patchValue({ formaEntrega: option?.metodo ?? '' });
  }

  submit(): void {
    if (this.cartService.isEmpty()) {
      this.feedbackService.show('Adicione produtos ao carrinho antes de finalizar.', 'error');
      return;
    }

    if (this.checkoutForm.invalid || !this.selectedShipping()) {
      this.checkoutForm.markAllAsTouched();
      this.feedbackService.show('Preencha os dados obrigatórios e selecione uma forma de entrega.', 'error');
      return;
    }

    this.isSubmitting.set(true);

    this.checkoutService
      .createOrder(this.customerPayload(), this.cartService.items(), this.deliveryPayload())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (order) => {
          this.saveLastOrder(order);
          this.cartService.clearCart();
          this.feedbackService.show(`Pedido ${order.id} confirmado com sucesso!`, 'success');
          void this.router.navigateByUrl('/pedido-confirmado');
        },
        error: (error) => {
          const message = error?.error?.detail ?? 'Não foi possível finalizar o pedido. Verifique a API e tente novamente.';
          this.feedbackService.show(message, 'error');
        },
      });
  }

  hasError(field: keyof typeof this.checkoutForm.controls): boolean {
    const control = this.checkoutForm.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  private customerPayload(): CustomerData {
    const value = this.checkoutForm.getRawValue();

    return {
      nome: value.nome,
      email: value.email,
      telefone: value.telefone,
      endereco: this.fullAddress(),
      formaPagamento: value.formaPagamento,
    };
  }

  private deliveryPayload(): DeliverySelection {
    const value = this.checkoutForm.getRawValue();
    const option = this.selectedShipping();

    if (!option) {
      throw new Error('Forma de entrega não selecionada.');
    }

    return {
      metodo: option.metodo,
      nome: option.nome,
      preco: option.preco,
      prazo: option.prazo,
      cep: value.cep,
      logradouro: value.endereco,
      numero: value.numero,
      complemento: value.complemento,
      bairro: value.bairro,
      cidade: value.cidade,
      estado: value.estado,
    };
  }

  private fullAddress(): string {
    const value = this.checkoutForm.getRawValue();
    const complement = value.complemento ? `, ${value.complemento}` : '';

    return `${value.endereco}, ${value.numero}${complement} - ${value.bairro}, ${value.cidade}/${value.estado} - CEP ${value.cep}`;
  }

  private saveLastOrder(order: Order): void {
    sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(order));
  }
}
