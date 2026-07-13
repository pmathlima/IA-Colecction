from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass
from decimal import Decimal
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

from fastapi import HTTPException

FREE_SHIPPING_MINIMUM = Decimal("250.00")
STORE_CITY = "belem"
STORE_STATE = "PA"
METROPOLITAN_CITIES = {"ananindeua", "marituba", "benevides", "santa barbara do para"}


@dataclass(frozen=True)
class AddressData:
    cep: str
    logradouro: str
    bairro: str
    cidade: str
    estado: str


@dataclass(frozen=True)
class DeliveryOptionData:
    metodo: str
    nome: str
    preco: Decimal
    prazo: str
    descricao: str


def only_digits(value: str) -> str:
    return re.sub(r"\D", "", value or "")


def normalize_text(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value or "")
    without_accents = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    return without_accents.lower().strip()


def lookup_cep(cep: str) -> AddressData:
    sanitized = only_digits(cep)

    if len(sanitized) != 8:
        raise HTTPException(status_code=400, detail="Informe um CEP válido com 8 dígitos.")

    try:
        with urlopen(f"https://viacep.com.br/ws/{sanitized}/json/", timeout=8) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=502, detail="Não foi possível consultar o CEP agora. Tente novamente.") from exc

    if payload.get("erro"):
        raise HTTPException(status_code=404, detail="CEP não encontrado.")

    return AddressData(
        cep=sanitized,
        logradouro=payload.get("logradouro") or "",
        bairro=payload.get("bairro") or "",
        cidade=payload.get("localidade") or "",
        estado=payload.get("uf") or "",
    )


def pickup_option() -> DeliveryOptionData:
    return DeliveryOptionData(
        metodo="RETIRADA",
        nome="Retirada na loja",
        preco=Decimal("0.00"),
        prazo="Disponível em até 1 dia útil",
        descricao="Retire seu pedido diretamente com a equipe da IA Collection.",
    )


def calculate_delivery_option(address: AddressData, subtotal: Decimal) -> DeliveryOptionData:
    city = normalize_text(address.cidade)
    state = (address.estado or "").upper().strip()

    if city == STORE_CITY:
        option = DeliveryOptionData(
            metodo="ENTREGA_LOCAL",
            nome="Entrega local",
            preco=Decimal("10.00"),
            prazo="1 a 2 dias úteis",
            descricao="Entrega para clientes em Belém.",
        )
    elif city in METROPOLITAN_CITIES:
        option = DeliveryOptionData(
            metodo="ENTREGA_METROPOLITANA",
            nome="Entrega região metropolitana",
            preco=Decimal("18.00"),
            prazo="2 a 3 dias úteis",
            descricao="Entrega para cidades próximas da região metropolitana.",
        )
    elif state == STORE_STATE:
        option = DeliveryOptionData(
            metodo="ENTREGA_ESTADUAL",
            nome="Entrega estadual",
            preco=Decimal("25.00"),
            prazo="3 a 6 dias úteis",
            descricao="Entrega para outros municípios do Pará.",
        )
    else:
        option = DeliveryOptionData(
            metodo="ENTREGA_NACIONAL",
            nome="Entrega nacional",
            preco=Decimal("35.00"),
            prazo="5 a 10 dias úteis",
            descricao="Entrega para outros estados do Brasil.",
        )

    if subtotal >= FREE_SHIPPING_MINIMUM:
        return DeliveryOptionData(
            metodo=option.metodo,
            nome=f"{option.nome} com frete grátis",
            preco=Decimal("0.00"),
            prazo=option.prazo,
            descricao=f"Frete grátis aplicado para pedidos acima de R$ {FREE_SHIPPING_MINIMUM}.",
        )

    return option


def calculate_shipping_options(address: AddressData, subtotal: Decimal) -> list[DeliveryOptionData]:
    return [pickup_option(), calculate_delivery_option(address, subtotal)]
