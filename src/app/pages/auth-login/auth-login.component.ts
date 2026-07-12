import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CustomerAuthService } from '../../core/services/customer-auth.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, UiButtonComponent],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLoginComponent {
  protected readonly isSubmitting = signal(false);

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(CustomerAuthService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly router = inject(Router);

  protected readonly loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.feedbackService.show('Informe e-mail e senha corretamente.', 'error');
      return;
    }

    this.isSubmitting.set(true);

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.feedbackService.show('Login realizado com sucesso.', 'success');
          void this.router.navigateByUrl('/minha-conta');
        },
        error: (error) => {
          const message = error?.error?.detail ?? 'Não foi possível entrar. Verifique seus dados.';
          this.feedbackService.show(message, 'error');
        },
      });
  }

  hasError(field: keyof typeof this.loginForm.controls): boolean {
    const control = this.loginForm.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }
}
