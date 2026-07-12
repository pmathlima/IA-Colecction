from __future__ import annotations

import os
from secrets import compare_digest

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

load_dotenv()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@iacollection.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
ADMIN_ACCESS_TOKEN = os.getenv("ADMIN_ACCESS_TOKEN", "ia-collection-admin-token")

security = HTTPBearer(auto_error=False)


def validate_admin_credentials(email: str, password: str) -> bool:
    return compare_digest(email.strip().lower(), ADMIN_EMAIL.lower()) and compare_digest(password, ADMIN_PASSWORD)


def require_admin(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais administrativas não informadas.",
        )

    if not compare_digest(credentials.credentials, ADMIN_ACCESS_TOKEN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token administrativo inválido.",
        )

    return ADMIN_EMAIL
