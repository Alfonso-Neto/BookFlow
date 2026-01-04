# BookFlow 📚

O **BookFlow** é um sistema moderno de gerenciamento de biblioteca, projetado para facilitar o controle de livros e empréstimos. Construído com uma arquitetura Full Stack robusta, ele oferece uma experiência fluida para administradores e usuários.

## 🚀 Tecnologias

Este projeto foi desenvolvido utilizando as seguintes tecnologias:

*   **Frontend:** [Next.js](https://nextjs.org/) (React), [TailwindCSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) (Animações), [Lucide React](https://lucide.dev/) (Ícones).
*   **Backend:** [Node.js](https://nodejs.org/) com [Express](https://expressjs.com/).
*   **Banco de Dados & Autenticação:** [Supabase](https://supabase.com/) (PostgreSQL).
*   **Estilização:** Design moderno com Dark Mode e componentes responsivos.

## ✨ Funcionalidades

*   **Autenticação Completa:** Login e Cadastro de usuários seguros via Supabase Auth.
*   **Dashboard Interativo:** Visualização rápida de estatísticas (Total de Livros, Empréstimos Ativos, etc.).
*   **Gerenciamento de Livros:** Adicionar, editar e remover livros do acervo (Apenas Admin).
*   **Controle de Empréstimos:**
    *   Usuários podem visualizar seus próprios empréstimos.
    *   Administradores podem visualizar e gerenciar todos os empréstimos.
*   **Sistema de Cargos (RBAC):** Diferenciação entre usuários comuns e administradores.
*   **Notificações:** Sistema de "Toasts" para feedback visual de ações (sucesso/erro).

## 🛠️ Instalação e Configuração

Siga os passos abaixo para rodar o projeto localmente.

### Pré-requisitos

*   Node.js instalado.
*   Uma conta no [Supabase](https://supabase.com/).

### 1. Clone o Repositório

```bash
git clone (https://github.com/Alfonso-Neto/BookFlow.git
cd bookflow
```

### 2. Configuração do Banco de Dados (Supabase)

1.  Crie um novo projeto no Supabase.
2.  Vá até o **SQL Editor** no painel do Supabase.
3.  Copie o conteúdo do arquivo `server/schema.sql` deste projeto e execute-o. Isso criará as tabelas e políticas de segurança necessárias.

### 3. Configuração das Variáveis de Ambiente

Você precisa configurar as chaves de acesso em duas pastas: `client` e `server`.

**No Cliente (`client/.env.local`):**
Crie o arquivo e adicione:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_publica
```

**No Servidor (`server/.env`):**
Crie o arquivo e adicione:
```env
PORT=3001
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_service_role_secreta
```

### 4. Instale as Dependências

**Frontend:**
```bash
cd client
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 5. Executando o Projeto

Você precisará de dois terminais abertos:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

Acesse a aplicação em `http://localhost:3000`.

## 👤 Tornando-se Administrador

Por padrão, novos usuários são criados com o cargo de `user`. Para se tornar um administrador:

1.  Crie uma conta na aplicação.
2.  No SQL Editor do Supabase, execute:
    ```sql
    UPDATE public.profiles SET role = 'admin' WHERE email = 'seu@email.com';
    ```
3.  Faça logout e login novamente para ver as funcionalidades de administrador.

## 📄 Licença

Este projeto está sob a licença MIT. Sinta-se à vontade para usar e modificar.
