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
- Painel administrativo para listar pedidos, visualizar detalhes e alterar status.
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
POST   /api/contact
GET    /api/contact
```

## Observações

- As imagens dos produtos são SVGs locais em `public/assets/products`, para facilitar a apresentação sem depender de serviços externos.
- O frontend busca os produtos pela API em `http://localhost:8000/api/products`.
- Caso a API esteja desligada, o frontend mantém uma lista local de demonstração como fallback para não quebrar a apresentação.
- O banco SQLite é criado automaticamente dentro da pasta `backend` no primeiro start da API.
- Para recriar os produtos do zero, apague o arquivo `backend/ia_collection.db` e rode novamente o backend.

## Painel administrativo de produtos

Esta versão inclui um painel administrativo inicial para gerenciamento do catálogo.

Rotas do frontend:

```txt
/admin/login
/admin/produtos
/admin/produtos/novo
/admin/produtos/:id/editar
```

Credenciais padrão em ambiente de desenvolvimento:

```txt
E-mail: admin@iacollection.com
Senha: admin123
```

Essas credenciais podem ser alteradas no backend usando variáveis de ambiente:

```env
ADMIN_EMAIL=admin@iacollection.com
ADMIN_PASSWORD=admin123
ADMIN_ACCESS_TOKEN=troque-este-token-em-producao
```

Endpoints administrativos da API:

```txt
POST   /api/admin/login
GET    /api/admin/products
GET    /api/admin/products/{id}
POST   /api/admin/products
PUT    /api/admin/products/{id}
DELETE /api/admin/products/{id}
```

As rotas administrativas de produto exigem o token Bearer retornado no login.

## Painel administrativo de pedidos

Esta versão também inclui acompanhamento administrativo dos pedidos recebidos no checkout.

Rotas do frontend:

```txt
/admin/pedidos
/admin/pedidos/:id
```

Funcionalidades disponíveis:

- Listagem de pedidos recebidos.
- Visualização dos dados da cliente.
- Visualização dos itens comprados.
- Cálculo do total do pedido.
- Alteração do status do pedido.

Status disponíveis:

```txt
NOVO
EM_ANALISE
PAGO
ENVIADO
FINALIZADO
CANCELADO
```

Endpoints administrativos da API:

```txt
GET    /api/admin/orders
GET    /api/admin/orders/{id}
PATCH  /api/admin/orders/{id}/status
```

Essas rotas exigem o token Bearer retornado no login administrativo.

### Atualizar na VPS

Depois de fazer merge da branch no GitHub, na VPS rode:

```bash
cd /var/www/ia-collection
git pull
npm install
npm run build
cd backend
source .venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart ia-collection-api
sudo systemctl restart nginx
```

Caso o frontend na VPS use `/api` no lugar de `http://localhost:8000/api`, confira o arquivo:

```txt
src/app/core/config/api.config.ts
```


## Área da Cliente

A aplicação também possui área da cliente com cadastro, login, atualização de dados e acompanhamento de pedidos.

Rotas adicionadas no frontend:

- `/cadastro` — criação de conta da cliente;
- `/login` — login da cliente;
- `/minha-conta` — dados pessoais e endereço;
- `/meus-pedidos` — histórico de pedidos vinculados à conta;
- `/meus-pedidos/:id` — detalhes de um pedido da cliente.

Endpoints adicionados no backend:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/customer/me`
- `PUT /api/customer/me`
- `GET /api/customer/orders`
- `GET /api/customer/orders/{id}`

O checkout continua permitindo compra como visitante. Quando a cliente está logada, o pedido é vinculado automaticamente à conta e aparece em **Meus pedidos**.


## Confirmação pelo WhatsApp

O checkout salva o pedido no banco e redireciona a cliente para a página `/pedido-confirmado`. Nessa tela, a cliente pode clicar em **Confirmar pelo WhatsApp** para abrir uma conversa com a loja usando uma mensagem pronta com número do pedido, dados da cliente, produtos e total.

Também existe um botão flutuante de WhatsApp disponível em todas as páginas da loja para contato rápido.

Para trocar o número da loja, edite:

```ts
src/app/core/config/store.config.ts
```

Atualize a constante:

```ts
export const STORE_WHATSAPP_NUMBER = '5591999999999';
```

Use o formato internacional sem `+`, espaços ou parênteses. Exemplo para Brasil/Pará: `5591999999999`.

## Galeria de imagens reais do produto

O painel administrativo de produtos permite enviar uma ou mais imagens reais para cada produto diretamente pelo navegador.

Na tela `/admin/produtos/novo` ou `/admin/produtos/:id/editar`, use o campo **Galeria de imagens do produto** para selecionar arquivos locais. O sistema aceita:

- JPG;
- PNG;
- WEBP;
- tamanho máximo de 5 MB por imagem;
- até 8 imagens por produto.

Após o envio, o backend salva os arquivos em `backend/uploads/products` e retorna URLs no formato:

```txt
/api/uploads/products/nome-do-arquivo.jpg
```

A primeira imagem da galeria é considerada a imagem principal do produto. No painel administrativo é possível:

- enviar várias imagens;
- visualizar miniaturas;
- definir qual imagem será a principal;
- remover imagens da galeria;
- salvar a galeria junto com o produto.

No catálogo, carrinho e painel administrativo é usada a imagem principal. Na página de detalhes do produto, as imagens aparecem como galeria com miniaturas clicáveis.

Endpoints administrativos adicionados:

```txt
POST /api/admin/products/upload-image
POST /api/admin/products/upload-images
```

Essas rotas exigem autenticação administrativa via Bearer Token.

> Observação: a pasta `backend/uploads/` fica fora do Git para evitar subir imagens reais no repositório. Na VPS, as imagens enviadas ficam salvas localmente no servidor.

## Módulo de variações de produto

Esta versão adiciona suporte a variações de produtos, importante para loja de roupas femininas.

Agora cada produto pode ter estoque separado por combinação de:

- Cor;
- Tamanho;
- SKU opcional;
- Status ativo/inativo;
- Estoque por variação.

No painel administrativo, em `Admin > Produtos > Novo/Editar`, é possível cadastrar várias combinações, por exemplo:

```txt
Vestido Aurora Vinho
├── Vinho / P - 5 unidades
├── Vinho / M - 5 unidades
├── Vinho / G - 4 unidades
└── Marfim / M - 4 unidades
```

Na loja pública, a cliente escolhe cor e tamanho na página de detalhes antes de adicionar ao carrinho. O carrinho salva a variação escolhida e o checkout reduz o estoque correto no backend.

### Endpoints adicionados/ajustados

```txt
POST   /api/admin/products/{id}/variations
PUT    /api/admin/products/{id}/variations/{variation_id}
DELETE /api/admin/products/{id}/variations/{variation_id}
```

O payload de pedido agora aceita `variacaoId` nos itens:

```json
{
  "produtoId": 1,
  "variacaoId": 2,
  "quantidade": 1
}
```

Se um produto possui variações ativas, a API exige que o pedido informe a variação escolhida.
