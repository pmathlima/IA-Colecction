import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ProductCategory } from '../../../core/models/product.model';

@Component({
  selector: 'app-category-badge',
  standalone: true,
  templateUrl: './category-badge.component.html',
  styleUrl: './category-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryBadgeComponent {
  readonly category = input.required<ProductCategory>();
}
