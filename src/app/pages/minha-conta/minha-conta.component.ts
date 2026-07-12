import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from "@angular/core";
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";

import { CustomerAuthService } from "../../core/services/customer-auth.service";
import { FeedbackService } from "../../core/services/feedback.service";
import { UiButtonComponent } from "../../shared/components/ui-button/ui-button.component";

@Component({
  selector: "app-minha-conta",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, UiButtonComponent],
  templateUrl: "./minha-conta.component.html",
  styleUrl: "./minha-conta.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MinhaContaComponent implements OnInit {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(CustomerAuthService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly router = inject(Router);

  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);

  protected readonly customer = this.authService.currentCustomer;
  protected readonly customerName = computed(
    () => this.customer()?.nome ?? "Cliente IA Collection",
  );

  protected readonly profileForm = this.formBuilder.group({
    nome: ["", [Validators.required, Validators.minLength(3)]],
    telefone: ["", [Validators.required, Validators.minLength(10)]],
    endereco: ["", [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    this.fillForm();
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);

    this.authService
      .loadProfile()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => this.fillForm(),
        error: () =>
          this.feedbackService.show(
            "Não foi possível carregar seus dados.",
            "error",
          ),
      });
  }

  submit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.feedbackService.show("Preencha os dados corretamente.", "error");
      return;
    }

    this.isSaving.set(true);

    this.authService
      .updateProfile(this.profileForm.getRawValue())
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () =>
          this.feedbackService.show(
            "Dados atualizados com sucesso.",
            "success",
          ),
        error: () =>
          this.feedbackService.show(
            "Não foi possível atualizar seus dados.",
            "error",
          ),
      });
  }

  logout(): void {
    this.authService.logout();
    this.feedbackService.show("Você saiu da área da cliente.", "success");
    void this.router.navigateByUrl("/");
  }

  hasError(field: keyof typeof this.profileForm.controls): boolean {
    const control = this.profileForm.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  private fillForm(): void {
    const customer = this.customer();

    if (!customer) {
      return;
    }

    this.profileForm.patchValue({
      nome: customer.nome,
      telefone: customer.telefone,
      endereco: customer.endereco,
    });
  }
}
