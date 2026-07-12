import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BrlCurrencyPipe } from '../../pipes/brl-currency.pipe';
import { UiButtonComponent } from '../ui-button/ui-button.component';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [RouterLink, BrlCurrencyPipe, UiButtonComponent],
  templateUrl: './cart-summary.component.html',
  styleUrl: './cart-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartSummaryComponent {
  readonly total = input.required<number>();
  readonly totalItems = input.required<number>();
  readonly disabled = input(false);
}
