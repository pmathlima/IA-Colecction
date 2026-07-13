import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProductService } from '../../core/services/product.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCardComponent, UiButtonComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  protected readonly productService = inject(ProductService);

  protected readonly benefits = [
    {
      icon: 'hanger',
      title: 'Curadoria exclusiva',
      description: 'Peças selecionadas com atenção aos detalhes e às últimas tendências.',
    },
    {
      icon: 'dress',
      title: 'Peças versáteis',
      description: 'Modelagens que valorizam o corpo e combinam com várias ocasiões.',
    },
    {
      icon: 'diamond',
      title: 'Estilo premium',
      description: 'Materiais de qualidade e acabamento impecável para você se sentir única.',
    },
    {
      icon: 'gift',
      title: 'Entrega cuidadosa',
      description: 'Embalagem especial e entrega rápida para todo o Brasil.',
    },
  ];

  protected readonly featuredCategories = [
    {
      label: 'Blusas',
      image: 'assets/products/blusa-marfim.svg',
    },
    {
      label: 'Vestidos',
      image: 'assets/products/vestido-aurora.svg',
    },
    {
      label: 'Conjuntos',
      image: 'assets/products/conjunto-livia.svg',
    },
    {
      label: 'Acessórios',
      image: 'assets/products/bolsa-grace.svg',
    },
  ];
}
