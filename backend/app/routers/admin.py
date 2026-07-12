from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload

from ..auth import ADMIN_ACCESS_TOKEN, require_admin, validate_admin_credentials
from ..database import get_db
from ..models import Order, Product, ProductImage
from ..schemas import (
    AdminInfo,
    AdminLoginRequest,
    AdminLoginResponse,
    ImageUploadResponse,
    ImagesUploadResponse,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    OrderResponse,
    OrderStatusUpdate,
    order_to_response,
    product_to_response,
)

router = APIRouter(prefix="/admin", tags=["Admin"])

BASE_DIR = Path(__file__).resolve().parents[2]
PRODUCT_UPLOADS_DIR = BASE_DIR / "uploads" / "products"
PRODUCT_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
MAX_PRODUCT_IMAGES = 8


def _normalize_image_urls(main_image: str, image_urls: list[str] | None = None) -> list[str]:
    normalized: list[str] = []

    for url in [main_image, *(image_urls or [])]:
        clean_url = (url or "").strip()

        if clean_url and clean_url not in normalized:
            normalized.append(clean_url)

    return normalized[:MAX_PRODUCT_IMAGES]


def _sync_product_images(product: Product, image_urls: list[str]) -> None:
    product.images.clear()

    for index, url in enumerate(image_urls):
        product.images.append(
            ProductImage(
                url=url,
                alt=f"{product.nome} - imagem {index + 1}",
                principal=index == 0,
                ordem=index,
            )
        )

    product.imagem = image_urls[0]


async def _save_uploaded_image(file: UploadFile) -> ImageUploadResponse:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato inválido. Envie uma imagem JPG, PNG ou WEBP.",
        )

    content = await file.read()

    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Arquivo vazio.")

    if len(content) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="A imagem deve ter no máximo 5 MB.",
        )

    extension = ALLOWED_IMAGE_TYPES[file.content_type]
    filename = f"{uuid4().hex}{extension}"
    destination = PRODUCT_UPLOADS_DIR / filename
    destination.write_bytes(content)

    return ImageUploadResponse(url=f"/api/uploads/products/{filename}", filename=filename)


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
    products = (
        db.query(Product)
        .options(joinedload(Product.images))
        .order_by(Product.data_criacao.desc())
        .all()
    )
    return [product_to_response(product) for product in products]


@router.post("/products/upload-image", response_model=ImageUploadResponse, dependencies=[Depends(require_admin)])
async def admin_upload_product_image(file: UploadFile = File(...)) -> ImageUploadResponse:
    return await _save_uploaded_image(file)


@router.post("/products/upload-images", response_model=ImagesUploadResponse, dependencies=[Depends(require_admin)])
async def admin_upload_product_images(files: list[UploadFile] = File(...)) -> ImagesUploadResponse:
    if len(files) > MAX_PRODUCT_IMAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Envie no máximo {MAX_PRODUCT_IMAGES} imagens por produto.",
        )

    images = [await _save_uploaded_image(file) for file in files]
    return ImagesUploadResponse(images=images)


@router.get("/products/{product_id}", response_model=ProductResponse, dependencies=[Depends(require_admin)])
def admin_get_product(product_id: int, db: Session = Depends(get_db)):
    product = (
        db.query(Product)
        .options(joinedload(Product.images))
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    return product_to_response(product)


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def admin_create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    image_urls = _normalize_image_urls(payload.imagem, payload.imagens)

    product = Product(
        nome=payload.nome.strip(),
        descricao=payload.descricao.strip(),
        preco=payload.preco,
        categoria=payload.categoria.strip(),
        imagem=image_urls[0],
        estoque=payload.estoque,
        destaque=payload.destaque,
    )
    _sync_product_images(product, image_urls)

    db.add(product)
    db.commit()
    db.refresh(product)

    return product_to_response(product)


@router.put("/products/{product_id}", response_model=ProductResponse, dependencies=[Depends(require_admin)])
def admin_update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = (
        db.query(Product)
        .options(joinedload(Product.images))
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")

    data = payload.model_dump(exclude_unset=True)
    images_payload = data.pop("imagens", None)

    for field, value in data.items():
        if isinstance(value, str):
            value = value.strip()
        setattr(product, field, value)

    if images_payload is not None or "imagem" in data:
        image_urls = _normalize_image_urls(product.imagem, images_payload)
        _sync_product_images(product, image_urls)

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
