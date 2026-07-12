export interface ContactMessage {
  nome: string;
  email: string;
  mensagem: string;
}

export interface ContactResponse extends ContactMessage {
  id: number;
  status: string;
  criadoEm: string;
}
