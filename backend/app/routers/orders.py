from __future__ import annotations

from decimal import Decimal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session, joinedload

from ..customer_auth import customer_security, get_optional_customer
from ..database import get_db
from ..models import Order, OrderItem, Product, ProductVariation
from ..schemas import OrderCreate, OrderResponse, order_to_response

router = APIRouter(prefix="/orders", tags=["Pedidos"])


def _sync_product_stock(product: Product) -> None:
    active_variations = [variation for variation in product.variations if variation.ativo]

    if active_variations:
        product.estoque = sum(variation.estoque for variation in active_variations)


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    credentials: HTTPAuthorizationCredentials | None = Depends(customer_security),
    db: Session = Depends(get_db),
):
    if not payload.itens:
        raise HTTPException(status_code=400, detail="O pedido precisa ter pelo menos um produto.")

    product_ids = [item.produtoId for item in payload.itens]
    products = (
        db.query(Product)
        .options(joinedload(Product.variations))
        .filter(Product.id.in_(product_ids))
        .all()
    )
    products_by_id = {product.id: product for product in products}

    variation_ids = [item.variacaoId for item in payload.itens if item.variacaoId]
    variations = db.query(ProductVariation).filter(ProductVariation.id.in_(variation_ids)).all() if variation_ids else []
    variations_by_id = {variation.id: variation for variation in variations}

    total = Decimal("0.00")
    order_items: list[OrderItem] = []

    for item in payload.itens:
        product = products_by_id.get(item.produtoId)

        if not product:
            raise HTTPException(status_code=404, detail=f"Produto {item.produtoId} não encontrado.")

        active_variations = [variation for variation in product.variations if variation.ativo]
        selected_variation: ProductVariation | None = None

        if active_variations:
            if not item.variacaoId:
                raise HTTPException(
                    status_code=400,
                    detail=f"Selecione tamanho e cor para o produto {product.nome}.",
                )

            selected_variation = variations_by_id.get(item.variacaoId)

            if not selected_variation or selected_variation.product_id != product.id or not selected_variation.ativo:
                raise HTTPException(status_code=400, detail=f"Variação inválida para o produto {product.nome}.")

            if selected_variation.estoque < item.quantidade:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Estoque insuficiente para {product.nome} "
                        f"({selected_variation.cor} / {selected_variation.tamanho}). "
                        f"Disponível: {selected_variation.estoque}."
                    ),
                )

            selected_variation.estoque -= item.quantidade
            _sync_product_stock(product)
        else:
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
                variation_id=selected_variation.id if selected_variation else None,
                variation_size=selected_variation.tamanho if selected_variation else None,
                variation_color=selected_variation.cor if selected_variation else None,
                variation_sku=selected_variation.sku if selected_variation else None,
                product_name=product.nome,
                unit_price=product.preco,
                quantity=item.quantidade,
                subtotal=subtotal,
            )
        )

    customer = get_optional_customer(credentials, db)

    order = Order(
        id=f"IA-{uuid4().hex[:8].upper()}",
        customer_id=customer.id if customer else None,
        cliente_nome=payload.cliente.nome,
        cliente_email=str(payload.cliente.email),
        cliente_telefone=payload.cliente.telefone,
        cliente_endereco=payload.cliente.endereco,
        forma_pagamento=payload.cliente.formaPagamento,
        total=total,
        status="NOVO",
        items=order_items,
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    return order_to_response(order)
