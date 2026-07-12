import { Pipe, PipeTransform } from '@angular/core';

import { API_BASE_URL } from '../../core/config/api.config';

@Pipe({
  name: 'imageUrl',
  standalone: true,
})
export class ImageUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return 'assets/products/vestido-aurora.svg';
    }

    const imageUrl = value.trim();

    if (!imageUrl) {
      return 'assets/products/vestido-aurora.svg';
    }

    if (
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://') ||
      imageUrl.startsWith('data:') ||
      imageUrl.startsWith('blob:') ||
      imageUrl.startsWith('assets/')
    ) {
      return imageUrl;
    }

    if (imageUrl.startsWith('/api/')) {
      if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
        const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
        return `${apiOrigin}${imageUrl}`;
      }

      return imageUrl;
    }

    return imageUrl.startsWith('/') ? imageUrl : imageUrl;
  }
}
