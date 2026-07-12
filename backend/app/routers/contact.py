from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import ContactMessage
from ..schemas import ContactCreate, ContactResponse

router = APIRouter(prefix="/contact", tags=["Contato"])


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact_message(payload: ContactCreate, db: Session = Depends(get_db)):
    message = ContactMessage(
        nome=payload.nome,
        email=str(payload.email),
        mensagem=payload.mensagem,
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return ContactResponse(
        id=message.id,
        nome=message.nome,
        email=message.email,
        mensagem=message.mensagem,
        status=message.status,
        criadoEm=message.criado_em,
    )


@router.get("", response_model=list[ContactResponse])
def list_contact_messages(db: Session = Depends(get_db)):
    messages = db.query(ContactMessage).order_by(ContactMessage.criado_em.desc()).all()

    return [
        ContactResponse(
            id=message.id,
            nome=message.nome,
            email=message.email,
            mensagem=message.mensagem,
            status=message.status,
            criadoEm=message.criado_em,
        )
        for message in messages
    ]
