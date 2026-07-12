import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AdminProductPayload } from '../../core/models/admin.model';
import { PRODUCT_CATEGORIES, ProductCategory, ProductVariation } from '../../core/models/product.model';
import { AdminProductService } from '../../core/services/admin-product.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';
import { ImageUrlPipe } from '../../shared/pipes/image-url.pipe';

@Component({
  selector: 'app-admin-produto-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, UiButtonComponent, ImageUrlPipe],
  templateUrl: './admin-produto-form.component.html',
  styleUrl: './admin-produto-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProdutoFormComponent implements OnInit {
  protected readonly categories = PRODUCT_CATEGORIES;
  protected readonly isSaving = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly isUploadingImage = signal(false);
  protected readonly productId = signal<number | null>(null);
  protected readonly isEditing = computed(() => this.productId() !== null);
  protected readonly pageTitle = computed(() => (this.isEditing() ? 'Editar produto' : 'Novo produto'));
  protected readonly galleryImages = signal<string[]>(['assets/products/vestido-aurora.svg']);
  protected readonly mainImage = computed(() => this.galleryImages()[0] || 'assets/products/vestido-aurora.svg');
  protected readonly variations = signal<ProductVariation[]>([]);
  protected readonly variationStockTotal = computed(() =>
    this.variations()
      .filter((variation) => variation.ativo)
      .reduce((total, variation) => total + Number(variation.estoque || 0), 0),
  );

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
      const imageUrl = value?.trim();

      if (!imageUrl) {
        return;
      }

      this.addImagesToGallery([imageUrl], true);
    });

    if (!Number.isNaN(id) && id > 0) {
      this.productId.set(id);
      this.loadProduct(id);
    }
  }

  uploadImages(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);

    if (!files.length) {
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeInBytes = 5 * 1024 * 1024;
    const maxImages = 8;

    if (this.galleryImages().length + files.length > maxImages) {
      this.feedbackService.show(`O produto pode ter no máximo ${maxImages} imagens.`, 'error');
      input.value = '';
      return;
    }

    const invalidFile = files.find((file) => !allowedTypes.includes(file.type));

    if (invalidFile) {
      this.feedbackService.show('Envie apenas imagens JPG, PNG ou WEBP.', 'error');
      input.value = '';
      return;
    }

    const oversizedFile = files.find((file) => file.size > maxSizeInBytes);

    if (oversizedFile) {
      this.feedbackService.show('Cada imagem deve ter no máximo 5 MB.', 'error');
      input.value = '';
      return;
    }

    this.isUploadingImage.set(true);

    this.productService
      .uploadProductImages(files)
      .pipe(finalize(() => this.isUploadingImage.set(false)))
      .subscribe({
        next: (response) => {
          this.addImagesToGallery(response.images.map((image) => image.url));
          this.feedbackService.show('Imagens enviadas com sucesso.', 'success');
          input.value = '';
        },
        error: () => {
          this.feedbackService.show('Não foi possível enviar as imagens.', 'error');
          input.value = '';
        },
      });
  }

  setMainImage(imageUrl: string): void {
    const images = this.galleryImages();

    if (!images.includes(imageUrl)) {
      return;
    }

    this.galleryImages.set([imageUrl, ...images.filter((image) => image !== imageUrl)]);
    this.productForm.controls.imagem.setValue(imageUrl, { emitEvent: false });
  }

  removeImage(imageUrl: string): void {
    const updatedImages = this.galleryImages().filter((image) => image !== imageUrl);

    if (!updatedImages.length) {
      this.feedbackService.show('O produto precisa ter pelo menos uma imagem.', 'error');
      return;
    }

    this.galleryImages.set(updatedImages);
    this.productForm.controls.imagem.setValue(updatedImages[0], { emitEvent: false });
  }

  addVariation(): void {
    this.variations.set([
      ...this.variations(),
      {
        id: null,
        cor: 'Vinho',
        tamanho: 'M',
        estoque: 0,
        sku: null,
        ativo: true,
      },
    ]);
  }

  updateVariation(index: number, field: keyof ProductVariation, value: string | number | boolean): void {
    this.variations.set(
      this.variations().map((variation, currentIndex) => {
        if (currentIndex !== index) {
          return variation;
        }

        return {
          ...variation,
          [field]: field === 'estoque' ? Number(value) : value,
        };
      }),
    );
  }

  removeVariation(index: number): void {
    this.variations.set(this.variations().filter((_, currentIndex) => currentIndex !== index));
  }

  submit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.feedbackService.show('Preencha os dados do produto corretamente.', 'error');
      return;
    }

    if (!this.validateVariations()) {
      return;
    }

    const rawValue = this.productForm.getRawValue();
    const variations = this.normalizedVariations();
    const payload: AdminProductPayload = {
      ...rawValue,
      estoque: variations.length ? this.variationStockTotal() : rawValue.estoque,
      imagem: this.mainImage(),
      imagens: this.galleryImages(),
      variacoes: variations,
    };
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
          const images = product.imagens?.length ? product.imagens : [product.imagem];

          this.productForm.patchValue({
            nome: product.nome,
            descricao: product.descricao,
            preco: product.preco,
            categoria: product.categoria,
            imagem: product.imagem,
            estoque: product.estoque,
            destaque: product.destaque,
          });
          this.galleryImages.set(images);
          this.variations.set(product.variacoes ?? []);
        },
        error: () => {
          this.feedbackService.show('Produto não encontrado.', 'error');
          void this.router.navigate(['/admin/produtos']);
        },
      });
  }

  private addImagesToGallery(imageUrls: string[], makeFirstImageMain = false): void {
    const currentImages = this.galleryImages();
    const mergedImages = [...currentImages];

    imageUrls.forEach((imageUrl) => {
      const cleanUrl = imageUrl.trim();

      if (cleanUrl && !mergedImages.includes(cleanUrl)) {
        mergedImages.push(cleanUrl);
      }
    });

    if (makeFirstImageMain && imageUrls[0]) {
      const mainImage = imageUrls[0].trim();
      this.galleryImages.set([mainImage, ...mergedImages.filter((image) => image !== mainImage)]);
      return;
    }

    this.galleryImages.set(mergedImages.slice(0, 8));
    this.productForm.controls.imagem.setValue(this.galleryImages()[0], { emitEvent: false });
  }

  private validateVariations(): boolean {
    const variations = this.normalizedVariations();
    const hasEmptyFields = variations.some((variation) => !variation.cor || !variation.tamanho || variation.estoque < 0);

    if (hasEmptyFields) {
      this.feedbackService.show('Preencha cor, tamanho e estoque das variações corretamente.', 'error');
      return false;
    }

    const keys = variations.map((variation) => `${variation.cor.toLowerCase()}-${variation.tamanho.toLowerCase()}`);
    const hasDuplicates = new Set(keys).size !== keys.length;

    if (hasDuplicates) {
      this.feedbackService.show('Não repita a mesma combinação de cor e tamanho.', 'error');
      return false;
    }

    return true;
  }

  private normalizedVariations(): ProductVariation[] {
    return this.variations()
      .map((variation) => ({
        ...variation,
        cor: variation.cor.trim(),
        tamanho: variation.tamanho.trim(),
        sku: variation.sku?.trim() || null,
        estoque: Number(variation.estoque || 0),
      }))
      .filter((variation) => variation.cor && variation.tamanho);
  }
}
