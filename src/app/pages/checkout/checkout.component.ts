import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CustomerData, PaymentMethod } from '../../core/models/order.model';
import { CartService } from '../../core/services/cart.service';
import { CheckoutService } from '../../core/services/checkout.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';
import { BrlCurrencyPipe } from '../../shared/pipes/brl-currency.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, UiButtonComponent, BrlCurrencyPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutComponent {
  protected readonly cartService = inject(CartService);
  protected readonly isSubmitting = signal(false);

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly checkoutService = inject(CheckoutService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly router = inject(Router);

  protected readonly checkoutForm = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', [Validators.required, Validators.minLength(10)]],
    endereco: ['', [Validators.required, Validators.minLength(8)]],
    formaPagamento: ['Pix' as PaymentMethod, Validators.required],
  });

  submit(): void {
    if (this.cartService.isEmpty()) {
      this.feedbackService.show('Adicione produtos ao carrinho antes de finalizar.', 'error');
      return;
    }

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.feedbackService.show('Preencha os dados obrigatórios corretamente.', 'error');
      return;
    }

    this.isSubmitting.set(true);

    this.checkoutService
      .createOrder(this.checkoutForm.getRawValue() as CustomerData, this.cartService.items())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (order) => {
          this.cartService.clearCart();
          this.feedbackService.show(`Pedido ${order.id} confirmado com sucesso!`, 'success');
          void this.router.navigateByUrl('/');
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
}
