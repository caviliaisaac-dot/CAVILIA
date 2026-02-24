# Configuração Supabase + Prisma — CAVILIA

Siga estes passos **nessa ordem** para conectar o app ao Supabase usando Prisma.

---

## 1. Criar projeto no Supabase

1. Acesse **[supabase.com](https://supabase.com)** e faça login (ou crie conta).
2. Clique em **New Project**.
3. Preencha:
   - **Name:** `cavilia` (ou o nome que quiser)
   - **Database Password:** crie uma senha **forte** e **guarde** (você vai usar no Prisma).
   - **Region:** escolha a mais próxima (ex.: South America São Paulo).
4. Clique em **Create new project** e aguarde o provisionamento (1–2 min).

---

## 2. Pegar a connection string (PostgreSQL)

1. No painel do Supabase, vá em **Project Settings** (ícone de engrenagem).
2. No menu lateral, clique em **Database**.
3. Role até **Connection string**.
4. Selecione a aba **URI**.
5. Copie a URL. Ela será algo como:
   ```txt
   postgresql://postgres.[PROJECT-REF]:[SENHA]@aws-0-[REGIAO].pooler.supabase.com:6543/postgres
   ```
6. **Substitua `[YOUR-PASSWORD]`** pela senha que você definiu ao criar o projeto.
   - Exemplo: se a URL vier `postgresql://postgres.xxx:YOUR-PASSWORD@...`, troque `YOUR-PASSWORD` pela senha real.

---

## 3. Configurar variáveis de ambiente no projeto

1. Na raiz do projeto (pasta `cavilia`), crie o arquivo **`.env.local`** (se ainda não existir).
2. Adicione uma linha com a URL do banco (use a URL que você colou e já com a senha trocada):

   ```env
   DATABASE_URL="postgresql://postgres.[SEU-PROJECT-REF]:[SUA-SENHA]@aws-0-[REGIAO].pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

   **Importante:** no final da URL, adicione `?pgbouncer=true` se você estiver usando a porta **6543** (connection pooler).  
   Se for usar a porta **5432** (conexão direta), use a URL sem `?pgbouncer=true`.

3. Para o Prisma com pooler (porta 6543), costuma-se usar uma URL direta para **migrations**. Crie também no `.env.local`:

   ```env
   DIRECT_URL="postgresql://postgres.[SEU-PROJECT-REF]:[SUA-SENHA]@aws-0-[REGIAO].pooler.supabase.com:5432/postgres"
   ```

   (Troque apenas a porta para `5432` na mesma URL; o `schema.prisma` vai usar isso.)

4. **Nunca** faça commit do `.env.local` (ele já deve estar no `.gitignore`).

---

## 4. Instalar dependências e criar as tabelas

No terminal, na pasta do projeto (`cavilia`):

```bash
npm install prisma @prisma/client --save
npx prisma generate
npx prisma migrate dev --name init
```

- Se pedir um nome para a migration, use `init`.
- O Prisma vai criar todas as tabelas no Supabase (User, Service, Booking, ScheduleDayOff, ScheduleTimeBlock).

---

## 5. (Opcional) Popular serviços iniciais

Para inserir os serviços padrão (Corte, Barba, etc.) no banco:

```bash
npm run db:seed
```

---

## 6. Rodar o app

```bash
npm run dev
```

Abra **http://localhost:3000**. Os dados de agendamentos, serviços, usuários e bloqueios de agenda passam a vir do Supabase.

---

## Resumo do que você fez

| Etapa | O que foi feito |
|-------|------------------|
| 1 | Criou o projeto no Supabase |
| 2 | Copiou a connection string e trocou a senha |
| 3 | Criou `.env.local` com `DATABASE_URL` e `DIRECT_URL` |
| 4 | Instalou Prisma, rodou `prisma generate` e `prisma migrate dev` |
| 5 | (Opcional) Rodou `prisma db seed` |
| 6 | Subiu o app com `npm run dev` |

---

## Tabelas criadas no Supabase

- **User** — clientes (nome, telefone, email, senha, foto, visitas, data de cadastro)
- **Service** — serviços (nome, descrição, preço, duração)
- **Booking** — agendamentos (serviço, cliente, data, horário, status)
- **ScheduleDayOff** — dias de folga (data)
- **ScheduleTimeBlock** — horários bloqueados (data, horário, label)

Qualquer dúvida em um passo, pare nesse passo e confira a URL, a senha e o conteúdo do `.env.local`.

---

## Supabase não está salvando? Diagnóstico

1. **Teste a conexão:** Com o app rodando (`npm run dev`), acesse:
   ```
   http://localhost:3000/api/db-check
   ```
   - Se retornar `"ok": true` → conexão OK. Se `services: 0`, rode `npm run db:seed`.
   - Se retornar erro → veja o campo `solucao` na resposta.

2. **Checklist:**
   - [ ] `.env.local` existe na pasta `cavilia` (não na raiz do projeto)
   - [ ] `DATABASE_URL` usa porta **6543** e termina com `?pgbouncer=true`
   - [ ] `DIRECT_URL` usa porta **5432** (sem pgbouncer)
   - [ ] A senha em `[YOUR-PASSWORD]` foi substituída pela senha real do projeto
   - [ ] Rodou `npx prisma migrate dev --name init` (cria as tabelas)
   - [ ] Rodou `npm run db:seed` (opcional, mas recomendado)
   - [ ] Reiniciou o servidor (`npm run dev`) após alterar o `.env`

3. **Onde fica o `.env.local`?** Na mesma pasta do `package.json`:
   ```
   cavilia/
   ├── .env.local    ← aqui
   ├── package.json
   ├── prisma/
   └── app/
   ```
