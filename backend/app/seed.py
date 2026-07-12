from __future__ import annotations

from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine
from .models import Product
from .seed_data import PRODUCTS


def run_light_migrations() -> None:
    """Aplica pequenos ajustes em bancos SQLite já existentes.

    O projeto usa SQLAlchemy create_all para fins acadêmicos, mas create_all não adiciona
    colunas novas em tabelas antigas. Esta migração leve mantém a VPS funcionando ao
    evoluir o esquema entre as branches.
    """
    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    if "orders" in table_names:
        order_columns = {column["name"] for column in inspector.get_columns("orders")}
        if "customer_id" not in order_columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE orders ADD COLUMN customer_id INTEGER"))


def seed_products(db: Session) -> None:
    existing_products = db.query(Product).count()
    if existing_products > 0:
        return

    for product_data in PRODUCTS:
        db.add(Product(**product_data))

    db.commit()


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    run_light_migrations()
    db = SessionLocal()
    try:
        seed_products(db)
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    print("Banco de dados criado e produtos iniciais cadastrados com sucesso.")
