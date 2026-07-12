from __future__ import annotations

from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Order, OrderItem, Product
from ..schemas import OrderCreate, OrderResponse, order_to_response

router = APIRouter(prefix="/orders", tags=["Pedidos"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    if not payload.itens:
        raise HTTPException(status_code=400, detail="O pedido precisa ter pelo menos um produto.")

    product_ids = [item.produtoId for item in payload.itens]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    products_by_id = {product.id: product for product in products}

    total = Decimal("0.00")
    order_items: list[OrderItem] = []

    for item in payload.itens:
        product = products_by_id.get(item.produtoId)

        if not product:
            raise HTTPException(status_code=404, detail=f"Produto {item.produtoId} não encontrado.")

        if product.estoque < item.quantidade:
            raise HTTPException(
                status_code=400,
                detail=f"Estoque insuficiente para o produto {product.nome}. Disponível: {product.estoque}.",
            )

        product.estoque -= item.quantidade
        subtotal = Decimal(product.preco) * Decimal(item.quantidade)
        total += subtotal

        order_items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.nome,
                unit_price=product.preco,
                quantity=item.quantidade,
                subtotal=subtotal,
            )
        )

    order = Order(
        id=f"IA-{uuid4().hex[:8].upper()}",
        cliente_nome=payload.cliente.nome,
        cliente_email=str(payload.cliente.email),
        cliente_telefone=payload.cliente.telefone,
        cliente_endereco=payload.cliente.endereco,
        forma_pagamento=payload.cliente.formaPagamento,
        total=total,
        status="CONFIRMADO",
        items=order_items,
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    return order_to_response(order)


@router.get("", response_model=list[OrderResponse])
def list_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).options(joinedload(Order.items)).order_by(Order.criado_em.desc()).all()
    return [order_to_response(order) for order in orders]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado.")

    return order_to_response(order)
