import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  CONTACT_STATUS_LABELS,
  CONTACT_STATUS_OPTIONS,
  ContactResponse,
  ContactStatus,
} from '../../core/models/contact.model';
import { AdminAuthService } from '../../core/services/admin-auth.service';
import { AdminContactService } from '../../core/services/admin-contact.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { UiButtonComponent } from '../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-admin-mensagens',
  standalone: true,
  imports: [RouterLink, DatePipe, UiButtonComponent],
  templateUrl: './admin-mensagens.component.html',
  styleUrl: './admin-mensagens.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMensagensComponent implements OnInit {
  protected readonly messages = signal<ContactResponse[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly selectedStatus = signal<ContactStatus | 'TODAS'>('TODAS');
  protected readonly statusOptions = CONTACT_STATUS_OPTIONS;
  protected readonly adminName = computed(() => this.authService.currentAdminName() ?? 'Administrador');
  protected readonly totalMessages = computed(() => this.messages().length);
  protected readonly newMessages = computed(() => this.messages().filter((message) => message.status === 'NOVA').length);
  protected readonly pendingMessages = computed(() =>
    this.messages().filter((message) => ['NOVA', 'LIDA'].includes(message.status)).length,
  );

  private readonly contactService = inject(AdminContactService);
  private readonly authService = inject(AdminAuthService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.isLoading.set(true);

    this.contactService
      .listMessages(this.selectedStatus())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (messages) => this.messages.set(messages),
        error: () => this.feedbackService.show('Não foi possível carregar as mensagens de contato.', 'error'),
      });
  }

  changeStatusFilter(status: string): void {
    this.selectedStatus.set(status as ContactStatus | 'TODAS');
    this.loadMessages();
  }

  statusLabel(status: ContactStatus): string {
    return CONTACT_STATUS_LABELS[status] ?? status;
  }

  statusClass(status: ContactStatus): string {
    return `status--${status.toLowerCase()}`;
  }

  logout(): void {
    this.authService.logout();
    this.feedbackService.show('Sessão administrativa encerrada.', 'success');
    void this.router.navigate(['/admin/login']);
  }
}
