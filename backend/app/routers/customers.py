from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from ..customer_auth import hash_password, make_customer_token, require_customer, verify_password
from ..database import get_db
from ..models import Customer, Order
from ..schemas import (
    CustomerInfo,
    CustomerLoginRequest,
    CustomerLoginResponse,
    CustomerRegisterRequest,
    CustomerUpdateRequest,
    OrderResponse,
    customer_to_response,
    order_to_response,
)

router = APIRouter(tags=["Clientes"])


@router.post("/auth/register", response_model=CustomerLoginResponse, status_code=status.HTTP_201_CREATED)
def register_customer(payload: CustomerRegisterRequest, db: Session = Depends(get_db)):
    email = str(payload.email).strip().lower()
    existing = db.query(Customer).filter(Customer.email == email).first()

    if existing:
        raise HTTPException(status_code=409, detail="Já existe uma conta cadastrada com este e-mail.")

    salt, password_hash = hash_password(payload.password)
    customer = Customer(
        nome=payload.nome.strip(),
        email=email,
        telefone=payload.telefone.strip(),
        endereco=payload.endereco.strip(),
        password_salt=salt,
        password_hash=password_hash,
    )

    db.add(customer)
    db.commit()
    db.refresh(customer)

    return CustomerLoginResponse(accessToken=make_customer_token(customer), cliente=customer_to_response(customer))


@router.post("/auth/login", response_model=CustomerLoginResponse)
def login_customer(payload: CustomerLoginRequest, db: Session = Depends(get_db)):
    email = str(payload.email).strip().lower()
    customer = db.query(Customer).filter(Customer.email == email).first()

    if not customer or not verify_password(payload.password, customer.password_salt, customer.password_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos.")

    return CustomerLoginResponse(accessToken=make_customer_token(customer), cliente=customer_to_response(customer))


@router.get("/customer/me", response_model=CustomerInfo)
def get_profile(customer: Customer = Depends(require_customer)):
    return customer_to_response(customer)


@router.put("/customer/me", response_model=CustomerInfo)
def update_profile(
    payload: CustomerUpdateRequest,
    customer: Customer = Depends(require_customer),
    db: Session = Depends(get_db),
):
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)
    return customer_to_response(customer)


@router.get("/customer/orders", response_model=list[OrderResponse])
def list_customer_orders(
    customer: Customer = Depends(require_customer),
    db: Session = Depends(get_db),
):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.customer_id == customer.id)
        .order_by(Order.criado_em.desc())
        .all()
    )
    return [order_to_response(order) for order in orders]


@router.get("/customer/orders/{order_id}", response_model=OrderResponse)
def get_customer_order(
    order_id: str,
    customer: Customer = Depends(require_customer),
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order_id, Order.customer_id == customer.id)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado para esta cliente.")

    return order_to_response(order)
