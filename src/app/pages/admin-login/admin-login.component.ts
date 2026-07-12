import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AdminAuthService } from '../../core/services/admin-auth.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, UiButtonComponent],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLoginComponent {
  protected readonly isSubmitting = signal(false);

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(AdminAuthService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly router = inject(Router);

  protected readonly loginForm = this.formBuilder.group({
    email: ['admin@iacollection.com', [Validators.required, Validators.email]],
    password: ['admin123', [Validators.required, Validators.minLength(4)]],
  });

  submit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.feedbackService.show('Informe e-mail e senha do administrador.', 'error');
      return;
    }

    this.isSubmitting.set(true);

    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.feedbackService.show('Login administrativo realizado com sucesso.', 'success');
          void this.router.navigate(['/admin/produtos']);
        },
        error: () => {
          this.feedbackService.show('E-mail ou senha inválidos.', 'error');
        },
      });
  }

  hasError(field: keyof typeof this.loginForm.controls): boolean {
    const control = this.loginForm.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }
}
