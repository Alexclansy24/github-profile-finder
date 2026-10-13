
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-page',
  standalone: true,
  templateUrl: './search-page.html',
})
export class SearchPageComponent {
  private readonly router = inject(Router);

  readonly validationError = signal('');

  async onSubmit(value: string, event: SubmitEvent): Promise<void> {
    event.preventDefault();

    const username = value.trim();

    if (!username) {
      this.validationError.set('Please enter a GitHub username.');
      return;
    }

    this.validationError.set('');
    await this.router.navigate(['/users', username]);
  }

  clearValidationError(): void {
    this.validationError.set('');
  }
}
