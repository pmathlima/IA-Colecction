from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .routers import admin, contact, customers, orders, products, shipping
from .seed import init_db

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:4200")

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
PRODUCT_UPLOADS_DIR = UPLOADS_DIR / "products"
PRODUCT_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="IA Collection API",
    description="API backend da loja online de moda feminina IA Collection, com produtos, pedidos e contato.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


app.mount("/api/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")


@app.get("/api/health", tags=["Saúde"])
def health_check():
    return {"status": "online", "service": "IA Collection API"}


app.include_router(products.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(shipping.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
