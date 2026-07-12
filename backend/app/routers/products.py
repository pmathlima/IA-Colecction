from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, func
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Product
from ..schemas import ProductResponse, product_to_response

router = APIRouter(prefix="/products", tags=["Produtos"])


@router.get("", response_model=list[ProductResponse])
def list_products(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    featured: bool | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Product).options(joinedload(Product.images))

    if search:
        query = query.filter(func.lower(Product.nome).contains(search.strip().lower()))

    if category and category != "Todas":
        query = query.filter(Product.categoria == category)

    price_filters = []
    if min_price is not None:
        price_filters.append(Product.preco >= min_price)
    if max_price is not None:
        price_filters.append(Product.preco <= max_price)
    if price_filters:
        query = query.filter(and_(*price_filters))

    if featured is not None:
        query = query.filter(Product.destaque == featured)

    products = query.order_by(Product.destaque.desc(), Product.data_criacao.desc()).all()
    return [product_to_response(product) for product in products]


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).options(joinedload(Product.images)).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    return product_to_response(product)
