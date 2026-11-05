<div align="center">
  <h1>📚 Minha Estante</h1>
  <p><strong>Organize sua leitura e nunca mais esqueça uma resenha.</strong></p>

  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</div>

<br />

## 📖 Sobre o Projeto

O **Minha Estante** é uma aplicação Full-Stack projetada para resolver um problema real: manter um histórico consistente de leitura. Mais do que um simples CRUD, o sistema foi arquitetado para aplicar **regras de negócio rigorosas** no backend e refleti-las em uma **interface que obedece a essas regras**.

O projeto é dividido em duas partes principais (Backend e Frontend), comunicando-se via API RESTful.

## 🚀 Destaques de Engenharia

Este projeto foi construído com foco em **qualidade de código, escalabilidade e experiência do desenvolvedor (DX)**. 

*   **Arquitetura Limpa (Controller -> Service -> Prisma):** Separação estrita de responsabilidades. O Controller lida com HTTP, o Service dita a regra de negócio e o Prisma gerencia o banco.
*   **Máquina de Estados (Status):** A transição de status do livro (`quero_ler` -> `lendo` -> `lido`) é controlada por uma máquina de estados rígida. Tentar pular etapas ou fazer transições inválidas retorna erros específicos da API.
*   **Validação em Tempo de Execução (Zod):** Middleware customizado que atua como um "porteiro", validando `body`, `query` e `params` antes de chegarem aos Controllers, garantindo que dados sujos nunca toquem o banco de dados.
*   **Datas Automáticas e Fuso Horário:** Cálculo de "hoje" baseado estritamente no fuso `America/Sao_Paulo`, para preencher `data_inicio` e `data_conclusao` automaticamente conforme o status muda.
*   **Design System Próprio:** O frontend não usa bibliotecas de componentes prontas. Foi construído um Design System completo (Tailwind v4 com `@theme inline`), com tokens CSS, suporte nativo a Dark/Light mode e tipografia focada em leitura (Inter + Lora), respeitando contrastes WCAG AA/AAA.

## 🛠 Tecnologias Utilizadas

### Backend
*   **Node.js + TypeScript** (Configuração moderna com ESM e `NodeNext`).
*   **Express 5** (Framework HTTP minimalista).
*   **Prisma ORM** (Modelagem e migrações de banco de dados).
*   **PostgreSQL** (Banco de dados relacional).
*   **Zod** (Validação de schemas em tempo de execução).

### Frontend
*   **React 18 + Vite** (Build ultrarrápido).
*   **Tailwind CSS v4** (Estilização baseada em tokens de Design System).
*   **React Router Dom** (Navegação SPA).
*   **Axios** (Consumo da API).
*   **React Hook Form + Zod** (Gerenciamento e validação de formulários).

## 📐 Regras de Negócio Implementadas (Backend)

O coração do projeto está na API. Abaixo estão as principais regras que o sistema protege:

1.  **Prevenção de Duplicidade:** Não permite dois livros com o mesmo título e autor. A verificação normaliza o texto (minúsculas e sem espaços nas pontas) e conta com um índice único no banco para evitar concorrência.
2.  **Coerência de Datas:** A data de conclusão nunca pode ser anterior à data de início.
3.  **Validação de Nota:** A nota (1 a 5) só pode ser atribuída se o livro estiver com o status `lido`.
4.  **Erros Padronizados:** Erros retornam payloads padronizados (`VALIDATION_ERROR`, `DUPLICATE_BOOK`, `INVALID_TRANSITION`), facilitando o consumo pelo frontend.

## 🔧 Como rodar o projeto localmente

### Pré-requisitos
*   Node.js (v20+)
*   PostgreSQL instalado e rodando
*   Git

### 1. Clonando o repositório

```bash
git clone https://github.com/leolop3sdev520/minha-estante.git
cd minha-estante
```

### 2. Rodando o Backend

```bash
cd backend
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com sua DATABASE_URL (postgresql://usuario:senha@localhost:5432/minha_estante)

# Rode as migrations para criar as tabelas
npx prisma migrate dev

# Inicie o servidor
npm run dev
```
*O servidor estará rodando em `http://localhost:3333`*

### 3. Rodando o Frontend

Abra um novo terminal na raiz do projeto:

```bash
cd frontend
npm install

# Inicie o Vite
npm run dev
```
*Acesse `http://localhost:5173` no seu navegador.*

## 🗺️ Roadmap (V2)
- [ ] Implementação de Autenticação (JWT) e sistema de usuários.
- [ ] Isolamento de dados (cada usuário vê apenas a sua estante).
- [ ] Testes automatizados de integração (Vitest + Supertest).
- [ ] Deploy da API e do Frontend (CI/CD).

---
<p align="center">Desenvolvido com dedicação e foco em código limpo 🚀</p>
