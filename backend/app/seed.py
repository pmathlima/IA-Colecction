from __future__ import annotations

from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine
from .models import Product
from .seed_data import PRODUCTS


def seed_products(db: Session) -> None:
    existing_products = db.query(Product).count()
    if existing_products > 0:
        return

    for product_data in PRODUCTS:
        db.add(Product(**product_data))

    db.commit()


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_products(db)
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    print("Banco de dados criado e produtos iniciais cadastrados com sucesso.")
