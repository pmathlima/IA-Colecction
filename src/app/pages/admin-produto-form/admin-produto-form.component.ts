import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AdminProductPayload } from '../../core/models/admin.model';
import { PRODUCT_CATEGORIES, ProductCategory } from '../../core/models/product.model';
import { AdminProductService } from '../../core/services/admin-product.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-admin-produto-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, UiButtonComponent],
  templateUrl: './admin-produto-form.component.html',
  styleUrl: './admin-produto-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProdutoFormComponent implements OnInit {
  protected readonly categories = PRODUCT_CATEGORIES;
  protected readonly isSaving = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly productId = signal<number | null>(null);
  protected readonly isEditing = computed(() => this.productId() !== null);
  protected readonly pageTitle = computed(() => (this.isEditing() ? 'Editar produto' : 'Novo produto'));
  protected readonly previewImage = signal('assets/products/vestido-aurora.svg');

  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(AdminProductService);
  private readonly feedbackService = inject(FeedbackService);

  protected readonly productForm = this.formBuilder.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    descricao: ['', [Validators.required, Validators.minLength(10)]],
    preco: [0, [Validators.required, Validators.min(0.01)]],
    categoria: ['Vestidos' as ProductCategory, [Validators.required]],
    imagem: ['assets/products/vestido-aurora.svg', [Validators.required]],
    estoque: [0, [Validators.required, Validators.min(0)]],
    destaque: [false],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.productForm.controls.imagem.valueChanges.subscribe((value) => {
      this.previewImage.set(value || 'assets/products/vestido-aurora.svg');
    });

    if (!Number.isNaN(id) && id > 0) {
      this.productId.set(id);
      this.loadProduct(id);
    }
  }

  submit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.feedbackService.show('Preencha os dados do produto corretamente.', 'error');
      return;
    }

    const payload: AdminProductPayload = this.productForm.getRawValue();
    const id = this.productId();
    const request$ = id
      ? this.productService.updateProduct(id, payload)
      : this.productService.createProduct(payload);

    this.isSaving.set(true);

    request$.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: () => {
        this.feedbackService.show(
          id ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.',
          'success',
        );
        void this.router.navigate(['/admin/produtos']);
      },
      error: () => {
        this.feedbackService.show('Não foi possível salvar o produto.', 'error');
      },
    });
  }

  hasError(field: keyof typeof this.productForm.controls): boolean {
    const control = this.productForm.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  private loadProduct(id: number): void {
    this.isLoading.set(true);

    this.productService
      .getProduct(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (product) => {
          this.productForm.patchValue({
            nome: product.nome,
            descricao: product.descricao,
            preco: product.preco,
            categoria: product.categoria,
            imagem: product.imagem,
            estoque: product.estoque,
            destaque: product.destaque,
          });
          this.previewImage.set(product.imagem);
        },
        error: () => {
          this.feedbackService.show('Produto não encontrado.', 'error');
          void this.router.navigate(['/admin/produtos']);
        },
      });
  }
}
