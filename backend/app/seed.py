from __future__ import annotations

from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine
from .models import Product, ProductVariation
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

    if "order_items" in table_names:
        order_item_columns = {column["name"] for column in inspector.get_columns("order_items")}
        columns_to_add = {
            "variation_id": "INTEGER",
            "variation_size": "VARCHAR(20)",
            "variation_color": "VARCHAR(40)",
            "variation_sku": "VARCHAR(80)",
        }

        with engine.begin() as connection:
            for column_name, column_type in columns_to_add.items():
                if column_name not in order_item_columns:
                    connection.execute(text(f"ALTER TABLE order_items ADD COLUMN {column_name} {column_type}"))


def _default_variations(category: str, stock: int) -> list[dict]:
    if category == "Calçados":
        options = [("34", "Dourado"), ("35", "Dourado"), ("36", "Dourado"), ("37", "Dourado")]
    elif category == "Acessórios":
        options = [("Único", "Vinho"), ("Único", "Marfim")]
    else:
        options = [("P", "Vinho"), ("M", "Vinho"), ("G", "Vinho"), ("M", "Marfim")]

    base = max(stock // len(options), 0)
    remainder = stock % len(options)

    return [
        {
            "tamanho": size,
            "cor": color,
            "estoque": base + (1 if index < remainder else 0),
            "sku": None,
            "ativo": True,
        }
        for index, (size, color) in enumerate(options)
    ]


def seed_products(db: Session) -> None:
    existing_products = db.query(Product).count()
    if existing_products > 0:
        return

    for product_data in PRODUCTS:
        data = dict(product_data)
        variations = data.pop("variations", _default_variations(data["categoria"], data["estoque"]))
        product = Product(**data)

        for variation in variations:
            product.variations.append(ProductVariation(**variation))

        db.add(product)

    db.commit()


def backfill_variations(db: Session) -> None:
    products = db.query(Product).all()
    changed = False

    for product in products:
        if product.variations:
            continue

        for variation in _default_variations(product.categoria, product.estoque):
            product.variations.append(ProductVariation(**variation))

        changed = True

    if changed:
        db.commit()


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    run_light_migrations()
    db = SessionLocal()
    try:
        seed_products(db)
        backfill_variations(db)
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    print("Banco de dados criado e produtos iniciais cadastrados com sucesso.")
