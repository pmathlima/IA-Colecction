from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import admin, contact, customers, orders, products
from .seed import init_db

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:4200")

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


@app.get("/api/health", tags=["Saúde"])
def health_check():
    return {"status": "online", "service": "IA Collection API"}


app.include_router(products.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
