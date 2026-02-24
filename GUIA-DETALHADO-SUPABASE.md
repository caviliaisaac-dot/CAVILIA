# Guia detalhado — Configurar Supabase para o CAVILIA

Siga **cada passo na ordem**. Não pule nenhum.

---

## PASSO 1 — Criar o projeto no Supabase

1. Abra o navegador e acesse: **https://supabase.com**
2. Faça login (ou crie uma conta gratuita).
3. Clique no botão **"New Project"** (ou "Novo Projeto").
4. Preencha:
   - **Name:** `cavilia` (ou outro nome)
   - **Database Password:** crie uma senha **forte** (ex.: `MinhaS3nhaF0rt3!`) e **anote em um lugar seguro** — você vai precisar dela.
   - **Region:** escolha **South America (São Paulo)** se estiver no Brasil.
5. Clique em **"Create new project"**.
6. Aguarde 1–2 minutos até o projeto ficar pronto (ícone verde).

---

## PASSO 2 — Copiar a Connection String

1. No painel do Supabase, clique no **ícone de engrenagem** (⚙️) no canto inferior esquerdo — **Project Settings**.
2. No menu lateral esquerdo, clique em **Database**.
3. Role a página até a seção **"Connection string"**.
4. Clique na aba **"URI"** (não "Session mode" ou "Transaction").
5. Você verá uma URL parecida com:
   ```
   postgresql://postgres.[abcdefgh]:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```
6. Clique em **"Copy"** para copiar.
7. **Importante:** Cole no Bloco de Notas e substitua `[YOUR-PASSWORD]` pela senha que você criou no Passo 1.
   - Exemplo: se a senha é `MinhaS3nhaF0rt3!`, a URL ficará:
   ```
   postgresql://postgres.abcdefgh:MinhaS3nhaF0rt3!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```
8. **Se a senha tiver caracteres especiais** (como `@`, `#`, `%`), use **URL encode**:
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`

---

## PASSO 3 — Criar o arquivo `.env.local`

1. Abra o **Explorador de Arquivos** do Windows.
2. Navegue até: `C:\Users\bsbth\cavilia\cavilia`
3. **Confirme** que está na pasta correta: deve existir o arquivo `package.json` e a pasta `prisma`.
4. Clique com o botão direito na pasta → **Novo** → **Documento de texto**.
5. Nomeie o arquivo como: `.env.local` (com o ponto no início).
   - Se o Windows não deixar criar arquivo começando com ponto, crie como `env.local` e depois renomeie no Cursor/VS Code.
6. Abra o arquivo `.env.local` no Cursor ou no Bloco de Notas.

---

## PASSO 4 — Preencher o `.env.local`

1. Cole o seguinte conteúdo no `.env.local` (substitua pelos seus valores):

```
DATABASE_URL="postgresql://postgres.[SEU-PROJECT-REF]:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[SEU-PROJECT-REF]:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

2. **Substitua:**
   - `[SEU-PROJECT-REF]` → pelo ID do seu projeto (ex.: `abcdefgh` — vem na URL que você copiou)
   - `[SUA-SENHA]` → pela senha do banco

3. **Exemplo real** (não use esse, use o seu):
   ```
   DATABASE_URL="postgresql://postgres.xyz123:MinhaS3nhaF0rt3!@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.xyz123:MinhaS3nhaF0rt3!@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
   ```

4. **Atenção:**
   - `DATABASE_URL` termina com `?pgbouncer=true`
   - `DIRECT_URL` usa porta `5432` e **não** tem `?pgbouncer=true`
   - Se sua região for diferente (ex.: `us-east-1`), mantenha como está na URL que você copiou

5. Salve o arquivo (Ctrl+S).

---

## PASSO 5 — Abrir o terminal no PowerShell

1. Abra o **Cursor** (ou VS Code).
2. Abra a pasta do projeto: `C:\Users\bsbth\cavilia\cavilia`
3. Pressione **Ctrl+`** (ou vá em **Terminal** → **Novo Terminal**).
4. Confirme que o terminal está na pasta do projeto:

```
cd C:\Users\bsbth\cavilia\cavilia
```

---

## PASSO 6 — Rodar migrations (criar tabelas)

1. No terminal, digite:

```
npx prisma generate
```

2. Pressione **Enter** e aguarde terminar (alguns segundos).

3. Depois digite:

```
npx prisma migrate dev --name init
```

4. Aguarde. Se aparecer:
   - **"Are you sure you want to create and apply this migration?"** → digite `y` e Enter.
   - **"Enter a name for the new migration"** → digite `init` e Enter.

5. Se der erro **"Can't reach database server"** ou **"Connection refused"**:
   - Volte ao Passo 4 e confira a senha e a URL.
   - Verifique se não há espaço extra no início ou fim das linhas.

6. Se der **SUCESSO**, aparecerá algo como: `Applied migration 20260223202017_init`

---

## PASSO 7 — Popular serviços iniciais (opcional, mas recomendado)

1. No terminal, digite:

```
npm run db:seed
```

2. Aguarde. Deve aparecer: `Seed: serviços padrão criados.`

---

## PASSO 8 — Iniciar o app

1. No terminal, digite:

```
npm run dev
```

2. Aguarde aparecer algo como:
   ```
   Local: http://localhost:3000
   ou
   Local: http://localhost:3001
   ```

3. Anote a porta (3000 ou 3001).

---

## PASSO 9 — Testar a conexão

1. Abra o navegador e acesse: `http://localhost:3000/api/db-check` (ou 3001 se for essa a porta).

2. **Se aparecer:**
   ```json
   {"ok":true,"message":"Supabase conectado com sucesso!","tabelas":{"services":5,"bookings":0}}
   ```
   → **Tudo certo!** O Supabase está conectado.

3. **Se aparecer erro:**
   - Leia o campo `solucao` na resposta.
   - Verifique se o `.env.local` está correto (Passo 4).
   - Reinicie o servidor: Ctrl+C no terminal, depois `npm run dev` de novo.

---

## PASSO 10 — Testar um agendamento

1. No navegador, acesse: `http://localhost:3000` (ou 3001).

2. Faça login ou cadastre-se (se pedir).

3. Vá em **Agendar** → escolha um serviço → data → horário → confirme.

4. Se aparecer **"Agendamento Confirmado!"** → está funcionando.

5. **Recarregue a página** (F5). O agendamento deve continuar aparecendo.

6. **Se sumiu:** o problema pode ser:
   - API retornando erro (veja o console do navegador: F12 → Console)
   - Toast vermelho aparecendo? Leia a mensagem.

---

## Resumo — Checklist final

| # | Passo | Feito? |
|---|-------|--------|
| 1 | Criar projeto no Supabase | ☐ |
| 2 | Copiar Connection string e trocar senha | ☐ |
| 3 | Criar `.env.local` em `cavilia/cavilia` | ☐ |
| 4 | Preencher DATABASE_URL e DIRECT_URL | ☐ |
| 5 | Abrir terminal na pasta do projeto | ☐ |
| 6 | `npx prisma generate` e `npx prisma migrate dev --name init` | ☐ |
| 7 | `npm run db:seed` | ☐ |
| 8 | `npm run dev` | ☐ |
| 9 | `http://localhost:3000/api/db-check` retorna `ok: true` | ☐ |
| 10 | Fazer agendamento e recarregar — continua lá | ☐ |

---

## Erros comuns

| Erro | Solução |
|------|---------|
| `DATABASE_URL is not defined` | O `.env.local` não está na pasta correta ou o servidor não foi reiniciado. |
| `Can't reach database server` | URL ou senha erradas. Verifique no Supabase (Project Settings → Database). |
| `relation "services" does not exist` | Rode `npx prisma migrate dev --name init`. |
| `Serviço não encontrado` (404) | Rode `npm run db:seed`. |
| Agendamento some ao recarregar | Verifique o console (F12) e a rota `/api/db-check`. |

Se algo der errado, pare no passo em que ocorreu o erro e confira o que está descrito acima.
