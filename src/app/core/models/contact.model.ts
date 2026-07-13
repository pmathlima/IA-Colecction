export type ContactStatus = 'NOVA' | 'LIDA' | 'RESPONDIDA' | 'ARQUIVADA';

export const CONTACT_STATUS_OPTIONS: ContactStatus[] = ['NOVA', 'LIDA', 'RESPONDIDA', 'ARQUIVADA'];

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  NOVA: 'Nova',
  LIDA: 'Lida',
  RESPONDIDA: 'Respondida',
  ARQUIVADA: 'Arquivada',
};

export interface ContactMessage {
  nome: string;
  email: string;
  telefone: string;
  assunto: string;
  mensagem: string;
}

export interface ContactResponse extends ContactMessage {
  id: number;
  status: ContactStatus;
  criadoEm: string;
  atualizadoEm?: string | null;
}
