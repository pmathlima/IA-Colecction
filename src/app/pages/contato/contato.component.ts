import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { ContactService } from '../../core/services/contact.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [ReactiveFormsModule, UiButtonComponent],
  templateUrl: './contato.component.html',
  styleUrl: './contato.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContatoComponent {
  protected readonly isSubmitting = signal(false);

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly feedbackService = inject(FeedbackService);
  private readonly contactService = inject(ContactService);

  protected readonly contactForm = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    mensagem: ['', [Validators.required, Validators.minLength(10)]],
  });

  submit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.feedbackService.show('Preencha o formulário de contato corretamente.', 'error');
      return;
    }

    this.isSubmitting.set(true);

    this.contactService
      .sendMessage(this.contactForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.contactForm.reset();
          this.feedbackService.show('Mensagem enviada com sucesso! Em breve entraremos em contato.', 'success');
        },
        error: () => {
          this.feedbackService.show('Não foi possível enviar a mensagem. Verifique se a API está rodando.', 'error');
        },
      });
  }

  hasError(field: keyof typeof this.contactForm.controls): boolean {
    const control = this.contactForm.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }
}
