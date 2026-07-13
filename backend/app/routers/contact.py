from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ContactMessage
from ..schemas import ContactCreate, ContactResponse, contact_to_response

router = APIRouter(prefix="/contact", tags=["Contato"])


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact_message(payload: ContactCreate, db: Session = Depends(get_db)):
    message = ContactMessage(
        nome=payload.nome.strip(),
        email=str(payload.email),
        telefone=payload.telefone.strip(),
        assunto=payload.assunto.strip(),
        mensagem=payload.mensagem.strip(),
        status="NOVA",
        atualizado_em=datetime.utcnow(),
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return contact_to_response(message)
