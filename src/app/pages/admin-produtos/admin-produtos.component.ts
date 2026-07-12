import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Product } from '../../core/models/product.model';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { AdminProductService } from '../../core/services/admin-product.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';
import { BrlCurrencyPipe } from '../../shared/pipes/brl-currency.pipe';

@Component({
  selector: 'app-admin-produtos',
  standalone: true,
  imports: [RouterLink, UiButtonComponent, BrlCurrencyPipe],
  templateUrl: './admin-produtos.component.html',
  styleUrl: './admin-produtos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProdutosComponent implements OnInit {
  protected readonly products = signal<Product[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly adminName = computed(() => this.authService.currentAdminName() ?? 'Administrador');
  protected readonly totalProducts = computed(() => this.products().length);
  protected readonly featuredCount = computed(() => this.products().filter((product) => product.destaque).length);
  protected readonly stockCount = computed(() => this.products().reduce((total, product) => total + product.estoque, 0));

  private readonly productService = inject(AdminProductService);
  private readonly authService = inject(AdminAuthService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);

    this.productService
      .listProducts()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (products) => this.products.set(products),
        error: () => this.feedbackService.show('Não foi possível carregar os produtos do painel.', 'error'),
      });
  }

  deleteProduct(product: Product): void {
    const confirmed = confirm(`Deseja remover o produto "${product.nome}"?`);

    if (!confirmed) {
      return;
    }

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.products.update((products) => products.filter((item) => item.id !== product.id));
        this.feedbackService.show('Produto removido com sucesso.', 'success');
      },
      error: () => this.feedbackService.show('Não foi possível remover o produto.', 'error'),
    });
  }

  logout(): void {
    this.authService.logout();
    this.feedbackService.show('Sessão administrativa encerrada.', 'success');
    void this.router.navigate(['/admin/login']);
  }
}
