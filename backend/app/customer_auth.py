from __future__ import annotations

import hashlib
import hmac
import os
from secrets import compare_digest, token_hex

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import Customer

load_dotenv()

CUSTOMER_TOKEN_SECRET = os.getenv("CUSTOMER_TOKEN_SECRET", "ia-collection-customer-secret")
customer_security = HTTPBearer(auto_error=False)


def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    password_salt = salt or token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        password_salt.encode("utf-8"),
        150_000,
    ).hex()
    return password_salt, digest


def verify_password(password: str, salt: str, password_hash: str) -> bool:
    _, candidate_hash = hash_password(password, salt)
    return compare_digest(candidate_hash, password_hash)


def make_customer_token(customer: Customer) -> str:
    message = f"{customer.id}:{customer.email}".encode("utf-8")
    signature = hmac.new(CUSTOMER_TOKEN_SECRET.encode("utf-8"), message, hashlib.sha256).hexdigest()
    return f"{customer.id}.{signature}"


def get_customer_from_token(token: str, db: Session) -> Customer | None:
    try:
        customer_id_text, signature = token.split(".", 1)
        customer_id = int(customer_id_text)
    except ValueError:
        return None

    customer = db.get(Customer, customer_id)
    if not customer:
        return None

    expected = make_customer_token(customer).split(".", 1)[1]
    if not compare_digest(signature, expected):
        return None

    return customer


def require_customer(
    credentials: HTTPAuthorizationCredentials | None = Depends(customer_security),
    db: Session = Depends(get_db),
) -> Customer:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Faça login para acessar a área da cliente.",
        )

    customer = get_customer_from_token(credentials.credentials, db)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Sessão da cliente inválida.",
        )

    return customer


def get_optional_customer(
    credentials: HTTPAuthorizationCredentials | None,
    db: Session,
) -> Customer | None:
    if credentials is None or credentials.scheme.lower() != "bearer":
        return None

    return get_customer_from_token(credentials.credentials, db)
