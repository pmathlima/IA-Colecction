from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

PaymentMethod = Literal["Pix", "Cartão de Crédito", "Boleto Simulado"]
OrderStatus = Literal["NOVO", "EM_ANALISE", "PAGO", "ENVIADO", "FINALIZADO", "CANCELADO"]


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=4, max_length=120)


class AdminInfo(BaseModel):
    email: EmailStr
    nome: str


class AdminLoginResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    admin: AdminInfo


class CustomerRegisterRequest(BaseModel):
    nome: str = Field(min_length=3, max_length=120)
    email: EmailStr
    telefone: str = Field(min_length=10, max_length=40)
    endereco: str = Field(min_length=8)
    password: str = Field(min_length=6, max_length=120)


class CustomerLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=120)


class CustomerUpdateRequest(BaseModel):
    nome: str | None = Field(default=None, min_length=3, max_length=120)
    telefone: str | None = Field(default=None, min_length=10, max_length=40)
    endereco: str | None = Field(default=None, min_length=8)


class CustomerInfo(BaseModel):
    id: int
    nome: str
    email: EmailStr
    telefone: str
    endereco: str
    criadoEm: str


class CustomerLoginResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    cliente: CustomerInfo


class ProductVariationCreate(BaseModel):
    tamanho: str = Field(min_length=1, max_length=20)
    cor: str = Field(min_length=2, max_length=40)
    estoque: int = Field(ge=0)
    sku: str | None = Field(default=None, max_length=80)
    ativo: bool = True


class ProductVariationUpdate(BaseModel):
    tamanho: str | None = Field(default=None, min_length=1, max_length=20)
    cor: str | None = Field(default=None, min_length=2, max_length=40)
    estoque: int | None = Field(default=None, ge=0)
    sku: str | None = Field(default=None, max_length=80)
    ativo: bool | None = None


class ProductVariationResponse(BaseModel):
    id: int | None = None
    tamanho: str
    cor: str
    estoque: int
    sku: str | None = None
    ativo: bool


class ProductCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    descricao: str = Field(min_length=10)
    preco: float = Field(gt=0)
    categoria: str = Field(min_length=2, max_length=40)
    imagem: str = Field(min_length=1, max_length=255)
    imagens: list[str] = Field(default_factory=list, max_length=8)
    estoque: int = Field(ge=0)
    destaque: bool = False
    variacoes: list[ProductVariationCreate] = Field(default_factory=list, max_length=80)


class ProductUpdate(BaseModel):
    nome: str | None = Field(default=None, min_length=2, max_length=120)
    descricao: str | None = Field(default=None, min_length=10)
    preco: float | None = Field(default=None, gt=0)
    categoria: str | None = Field(default=None, min_length=2, max_length=40)
    imagem: str | None = Field(default=None, min_length=1, max_length=255)
    imagens: list[str] | None = Field(default=None, max_length=8)
    estoque: int | None = Field(default=None, ge=0)
    destaque: bool | None = None
    variacoes: list[ProductVariationCreate] | None = Field(default=None, max_length=80)


class ImageUploadResponse(BaseModel):
    url: str
    filename: str


class ImagesUploadResponse(BaseModel):
    images: list[ImageUploadResponse]


class ProductImageResponse(BaseModel):
    id: int | None = None
    url: str
    alt: str
    principal: bool
    ordem: int


class ProductResponse(BaseModel):
    id: int
    nome: str
    descricao: str
    preco: float
    categoria: str
    imagem: str
    imagens: list[str]
    galeria: list[ProductImageResponse]
    estoque: int
    destaque: bool
    dataCriacao: str
    variacoes: list[ProductVariationResponse]


class CustomerData(BaseModel):
    nome: str = Field(min_length=3, max_length=120)
    email: EmailStr
    telefone: str = Field(min_length=10, max_length=40)
    endereco: str = Field(min_length=8)
    formaPagamento: PaymentMethod


class OrderItemCreate(BaseModel):
    produtoId: int = Field(gt=0)
    quantidade: int = Field(gt=0)
    variacaoId: int | None = Field(default=None, gt=0)


class OrderCreate(BaseModel):
    cliente: CustomerData
    itens: list[OrderItemCreate] = Field(min_length=1)


class OrderItemResponse(BaseModel):
    produtoId: int
    variacaoId: int | None = None
    nome: str
    tamanho: str | None = None
    cor: str | None = None
    sku: str | None = None
    precoUnitario: float
    quantidade: int
    subtotal: float


class OrderResponse(BaseModel):
    id: str
    cliente: CustomerData
    itens: list[OrderItemResponse]
    total: float
    status: str
    criadoEm: str


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class ContactCreate(BaseModel):
    nome: str = Field(min_length=3, max_length=120)
    email: EmailStr
    mensagem: str = Field(min_length=10)


class ContactResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr
    mensagem: str
    status: str
    criadoEm: datetime

    model_config = ConfigDict(from_attributes=True)


def customer_to_response(customer) -> CustomerInfo:
    return CustomerInfo(
        id=customer.id,
        nome=customer.nome,
        email=customer.email,
        telefone=customer.telefone,
        endereco=customer.endereco,
        criadoEm=customer.criado_em.isoformat(),
    )


def _product_image_urls(product) -> list[str]:
    urls = [image.url for image in getattr(product, "images", []) if image.url]

    if not urls and product.imagem:
        urls = [product.imagem]

    if product.imagem and product.imagem not in urls:
        urls.insert(0, product.imagem)

    return urls


def _variation_to_response(variation) -> ProductVariationResponse:
    return ProductVariationResponse(
        id=variation.id,
        tamanho=variation.tamanho,
        cor=variation.cor,
        estoque=variation.estoque,
        sku=variation.sku,
        ativo=variation.ativo,
    )


def product_to_response(product) -> ProductResponse:
    image_urls = _product_image_urls(product)
    variations = list(getattr(product, "variations", []))

    return ProductResponse(
        id=product.id,
        nome=product.nome,
        descricao=product.descricao,
        preco=float(product.preco),
        categoria=product.categoria,
        imagem=product.imagem,
        imagens=image_urls,
        galeria=[
            ProductImageResponse(
                id=image.id,
                url=image.url,
                alt=image.alt,
                principal=image.principal,
                ordem=image.ordem,
            )
            for image in getattr(product, "images", [])
        ]
        or [
            ProductImageResponse(
                id=None,
                url=product.imagem,
                alt=product.nome,
                principal=True,
                ordem=0,
            )
        ],
        estoque=product.estoque,
        destaque=product.destaque,
        dataCriacao=product.data_criacao.isoformat(),
        variacoes=[_variation_to_response(variation) for variation in variations],
    )


def order_to_response(order) -> OrderResponse:
    return OrderResponse(
        id=order.id,
        cliente=CustomerData(
            nome=order.cliente_nome,
            email=order.cliente_email,
            telefone=order.cliente_telefone,
            endereco=order.cliente_endereco,
            formaPagamento=order.forma_pagamento,
        ),
        itens=[
            OrderItemResponse(
                produtoId=item.product_id,
                variacaoId=item.variation_id,
                nome=item.product_name,
                tamanho=item.variation_size,
                cor=item.variation_color,
                sku=item.variation_sku,
                precoUnitario=float(item.unit_price),
                quantidade=item.quantity,
                subtotal=float(item.subtotal),
            )
            for item in order.items
        ],
        total=float(order.total),
        status=order.status,
        criadoEm=order.criado_em.isoformat(),
    )
