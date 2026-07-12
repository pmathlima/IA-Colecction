from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload

from ..auth import ADMIN_ACCESS_TOKEN, require_admin, validate_admin_credentials
from ..database import get_db
from ..models import Order, Product
from ..schemas import (
    AdminInfo,
    AdminLoginRequest,
    AdminLoginResponse,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    OrderResponse,
    OrderStatusUpdate,
    order_to_response,
    product_to_response,
)

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/login", response_model=AdminLoginResponse)
def admin_login(credentials: AdminLoginRequest) -> AdminLoginResponse:
    if not validate_admin_credentials(credentials.email, credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha do administrador inválidos.",
        )

    return AdminLoginResponse(
        accessToken=ADMIN_ACCESS_TOKEN,
        admin=AdminInfo(email=credentials.email, nome="Administrador IA Collection"),
    )


@router.get("/products", response_model=list[ProductResponse], dependencies=[Depends(require_admin)])
def admin_list_products(db: Session = Depends(get_db)):
    products = db.query(Product).order_by(Product.data_criacao.desc()).all()
    return [product_to_response(product) for product in products]


@router.get("/products/{product_id}", response_model=ProductResponse, dependencies=[Depends(require_admin)])
def admin_get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    return product_to_response(product)


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def admin_create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    product = Product(
        nome=payload.nome.strip(),
        descricao=payload.descricao.strip(),
        preco=payload.preco,
        categoria=payload.categoria.strip(),
        imagem=payload.imagem.strip(),
        estoque=payload.estoque,
        destaque=payload.destaque,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product_to_response(product)


@router.put("/products/{product_id}", response_model=ProductResponse, dependencies=[Depends(require_admin)])
def admin_update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product_to_response(product)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def admin_delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    try:
        db.delete(product)
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Não foi possível remover o produto porque ele pode estar vinculado a um pedido.",
        ) from exc

@router.get("/orders", response_model=list[OrderResponse], dependencies=[Depends(require_admin)])
def admin_list_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).options(joinedload(Order.items)).order_by(Order.criado_em.desc()).all()
    return [order_to_response(order) for order in orders]


@router.get("/orders/{order_id}", response_model=OrderResponse, dependencies=[Depends(require_admin)])
def admin_get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")

    return order_to_response(order)


@router.patch("/orders/{order_id}/status", response_model=OrderResponse, dependencies=[Depends(require_admin)])
def admin_update_order_status(order_id: str, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")

    order.status = payload.status
    db.commit()
    db.refresh(order)

    return order_to_response(order)

