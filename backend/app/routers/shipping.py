from __future__ import annotations

from decimal import Decimal

from fastapi import APIRouter

from ..schemas import ShippingCalculateRequest, ShippingCalculateResponse, shipping_to_response
from ..shipping_rules import calculate_shipping_options, lookup_cep

router = APIRouter(prefix="/shipping", tags=["Frete"])


@router.post("/calculate", response_model=ShippingCalculateResponse)
def calculate_shipping(payload: ShippingCalculateRequest):
    address = lookup_cep(payload.cep)
    subtotal = Decimal(str(payload.subtotal))
    options = calculate_shipping_options(address, subtotal)

    return shipping_to_response(address, options)
