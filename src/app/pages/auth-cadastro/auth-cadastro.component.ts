import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CustomerAuthService } from '../../core/services/customer-auth.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-auth-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, UiButtonComponent],
  templateUrl: './auth-cadastro.component.html',
  styleUrl: './auth-cadastro.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthCadastroComponent {
  protected readonly isSubmitting = signal(false);

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(CustomerAuthService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly router = inject(Router);

  protected readonly cadastroForm = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', [Validators.required, Validators.minLength(10)]],
    endereco: ['', [Validators.required, Validators.minLength(8)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      this.feedbackService.show('Preencha os dados do cadastro corretamente.', 'error');
      return;
    }

    this.isSubmitting.set(true);

    this.authService
      .register(this.cadastroForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.feedbackService.show('Cadastro criado com sucesso.', 'success');
          void this.router.navigateByUrl('/minha-conta');
        },
        error: (error) => {
          const message = error?.error?.detail ?? 'Não foi possível criar o cadastro.';
          this.feedbackService.show(message, 'error');
        },
      });
  }

  hasError(field: keyof typeof this.cadastroForm.controls): boolean {
    const control = this.cadastroForm.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }
}
