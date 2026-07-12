# IA Collection — Loja Online Fullstack

Projeto fullstack de e-commerce para a marca **IA Collection**, uma loja online de **moda feminina** com identidade visual elegante, delicada e sofisticada. O projeto foi desenvolvido com **Angular**, **TypeScript**, **SCSS**, **FastAPI**, **SQLite** e **SQLAlchemy**.

A aplicação possui uma interface responsiva e profissional para venda de roupas, calçados e acessórios femininos. A identidade visual usa tons de **marfim**, **vinho**, **branco** e **dourado suave**, seguindo a logo da marca e transmitindo confiança, feminilidade e aparência premium.

## O que o projeto possui

### Frontend

- Home com banner, categorias e produtos em destaque.
- Catálogo com busca, filtro por categoria e filtro de preço.
- Página de detalhes do produto.
- Carrinho com alteração de quantidade, subtotal e total.
- Checkout com formulário validado.
- Página Sobre.
- Página Contato integrada com a API.
- Componentes reutilizáveis: header, footer, card de produto, botão padrão, filtros, busca, badge, resumo do carrinho e feedback.
- Layout responsivo para desktop, tablet e celular.
- Logo da IA Collection aplicada no projeto.
- Produtos femininos simulados com imagens SVG locais.

### Backend

- API REST com FastAPI.
- Banco de dados SQLite.
- Cadastro inicial automático de produtos femininos.
- Endpoints para produtos, pedidos e contato.
- Validação de estoque ao finalizar pedido.
- Atualização automática do estoque após compra.
- Armazenamento de pedidos no banco.
- Armazenamento de mensagens de contato.
- Documentação automática da API em `/docs`.

## Tecnologias utilizadas

- Angular
- TypeScript
- SCSS
- FastAPI
- Python
- SQLite
- SQLAlchemy
- Pydantic

## Como rodar o projeto completo

Abra dois terminais: um para o backend e outro para o frontend.

### 1. Rodar o backend

```bash
cd backend
python -m venv .venv
```

No Windows PowerShell:

```bash
.\.venv\Scripts\Activate.ps1
```

No Linux/macOS:

```bash
source .venv/bin/activate
```

Depois instale as dependências e suba a API:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

A API ficará disponível em:

```txt
http://localhost:8000
```

Documentação da API:

```txt
http://localhost:8000/docs
```

### 2. Rodar o frontend

Em outro terminal, na pasta raiz do projeto:

```bash
npm install
npm start
```

Acesse no navegador:

```txt
http://localhost:4200
```

## Estrutura principal

```txt
ia-collection-angular/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── seed.py
│   │   └── seed_data.py
│   ├── requirements.txt
│   └── README.md
├── public/
│   └── assets/
├── src/
│   └── app/
│       ├── core/
│       │   ├── config/
│       │   ├── data/
│       │   ├── models/
│       │   └── services/
│       ├── shared/
│       │   ├── components/
│       │   └── pipes/
│       ├── pages/
│       │   ├── home/
│       │   ├── produtos/
│       │   ├── produto-detalhe/
│       │   ├── carrinho/
│       │   ├── checkout/
│       │   ├── sobre/
│       │   └── contato/
│       ├── app.component.*
│       ├── app.config.ts
│       └── app.routes.ts
└── package.json
```

## Categorias de produtos

- Vestidos
- Blusas
- Conjuntos
- Saias
- Calçados
- Acessórios
- Lançamentos
- Promoções

## Endpoints principais da API

```txt
GET    /api/health
GET    /api/products
GET    /api/products/{id}
POST   /api/orders
GET    /api/orders
GET    /api/orders/{id}
POST   /api/contact
GET    /api/contact
```

## Observações

- As imagens dos produtos são SVGs locais em `public/assets/products`, para facilitar a apresentação sem depender de serviços externos.
- O frontend busca os produtos pela API em `http://localhost:8000/api/products`.
- Caso a API esteja desligada, o frontend mantém uma lista local de demonstração como fallback para não quebrar a apresentação.
- O banco SQLite é criado automaticamente dentro da pasta `backend` no primeiro start da API.
- Para recriar os produtos do zero, apague o arquivo `backend/ia_collection.db` e rode novamente o backend.
