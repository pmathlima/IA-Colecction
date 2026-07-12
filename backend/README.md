# Backend — IA Collection API

Backend real da loja **IA Collection**, desenvolvido com FastAPI, SQLite e SQLAlchemy para atender uma loja online de moda feminina.

## Recursos

- API REST de produtos.
- Cadastro inicial automático de 8 produtos femininos.
- Banco de dados SQLite local.
- Criação de pedidos com validação de estoque.
- Atualização automática do estoque após compra.
- Listagem e consulta de pedidos.
- Recebimento de mensagens do formulário de contato.
- CORS configurado para o frontend Angular em `http://localhost:4200`.
- Documentação automática em `/docs`.

## Como rodar o backend

No terminal, dentro da pasta `backend`:

```bash
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

Instale as dependências:

```bash
pip install -r requirements.txt
```

Inicie a API:

```bash
uvicorn app.main:app --reload
```

A API ficará disponível em:

```txt
http://localhost:8000
```

Documentação interativa:

```txt
http://localhost:8000/docs
```

## Endpoints principais

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

## Banco de dados

O banco SQLite é criado automaticamente no primeiro start da API:

```txt
backend/ia_collection.db
```

Para recriar os dados do zero, apague o arquivo `ia_collection.db` e rode novamente a API.

## Administração

O backend possui autenticação administrativa simples para o painel de produtos.

Variáveis disponíveis:

```env
ADMIN_EMAIL=admin@iacollection.com
ADMIN_PASSWORD=admin123
ADMIN_ACCESS_TOKEN=ia-collection-admin-token
```

Endpoints:

```txt
POST   /api/admin/login
GET    /api/admin/products
GET    /api/admin/products/{id}
POST   /api/admin/products
PUT    /api/admin/products/{id}
DELETE /api/admin/products/{id}
```

As rotas de produtos administrativos precisam do cabeçalho:

```txt
Authorization: Bearer <token>
```
