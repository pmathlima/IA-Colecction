import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  selector: 'app-admin-mensagem-detalhe',
  standalone: true,
  imports: [RouterLink, DatePipe, UiButtonComponent],
  templateUrl: './admin-mensagem-detalhe.component.html',
  styleUrl: './admin-mensagem-detalhe.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminMensagemDetalheComponent implements OnInit {
  protected readonly message = signal<ContactResponse | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly isUpdating = signal(false);
  protected readonly isDeleting = signal(false);
  protected readonly statusOptions = CONTACT_STATUS_OPTIONS;
  protected readonly adminName = computed(() => this.authService.currentAdminName() ?? 'Administrador');

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly contactService = inject(AdminContactService);
  private readonly authService = inject(AdminAuthService);
  private readonly feedbackService = inject(FeedbackService);

  ngOnInit(): void {
    const messageId = Number(this.route.snapshot.paramMap.get('id'));

    if (!messageId) {
      this.feedbackService.show('Mensagem não encontrada.', 'error');
      void this.router.navigate(['/admin/mensagens']);
      return;
    }

    this.loadMessage(messageId);
  }

  loadMessage(messageId: number): void {
    this.isLoading.set(true);

    this.contactService
      .getMessage(messageId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (message) => this.message.set(message),
        error: () => {
          this.feedbackService.show('Não foi possível carregar a mensagem.', 'error');
          void this.router.navigate(['/admin/mensagens']);
        },
      });
  }

  updateStatus(status: ContactStatus): void {
    const message = this.message();

    if (!message || message.status === status) {
      return;
    }

    this.isUpdating.set(true);

    this.contactService
      .updateStatus(message.id, status)
      .pipe(finalize(() => this.isUpdating.set(false)))
      .subscribe({
        next: (updatedMessage) => {
          this.message.set(updatedMessage);
          this.feedbackService.show('Status da mensagem atualizado com sucesso.', 'success');
        },
        error: () => this.feedbackService.show('Não foi possível atualizar o status da mensagem.', 'error'),
      });
  }

  deleteMessage(): void {
    const message = this.message();

    if (!message) {
      return;
    }

    const confirmed = window.confirm('Deseja remover esta mensagem de contato?');

    if (!confirmed) {
      return;
    }

    this.isDeleting.set(true);

    this.contactService
      .deleteMessage(message.id)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        next: () => {
          this.feedbackService.show('Mensagem removida com sucesso.', 'success');
          void this.router.navigate(['/admin/mensagens']);
        },
        error: () => this.feedbackService.show('Não foi possível remover a mensagem.', 'error'),
      });
  }

  emailLink(message: ContactResponse): string {
    const subject = encodeURIComponent(`Resposta IA Collection - ${message.assunto}`);
    return `mailto:${message.email}?subject=${subject}`;
  }

  whatsappLink(message: ContactResponse): string | null {
    const phone = message.telefone.replace(/\D/g, '');

    if (!phone) {
      return null;
    }

    const normalizedPhone = phone.startsWith('55') ? phone : `55${phone}`;
    const text = encodeURIComponent(`Olá, ${message.nome}! Recebemos sua mensagem na IA Collection sobre: ${message.assunto}.`);
    return `https://wa.me/${normalizedPhone}?text=${text}`;
  }

  statusLabel(status: ContactStatus): string {
    return CONTACT_STATUS_LABELS[status] ?? status;
  }

  statusClass(status: ContactStatus): string {
    return `status--${status.toLowerCase()}`;
  }

  asContactStatus(value: string): ContactStatus {
    return value as ContactStatus;
  }

  logout(): void {
    this.authService.logout();
    this.feedbackService.show('Sessão administrativa encerrada.', 'success');
    void this.router.navigate(['/admin/login']);
  }
}
