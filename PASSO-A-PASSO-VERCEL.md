# Passo a passo — Configurar CAVILIA na Vercel

Siga na ordem. Não pule nenhum passo.

---

## PASSO 1 — Pegar as URLs do Supabase

1. Abra **[supabase.com](https://supabase.com)** e faça login.
2. Clique no seu projeto **CAVILIA** (ou o nome que você deu).
3. No canto inferior esquerdo, clique no **ícone de engrenagem** (⚙️) → **Project Settings**.
4. No menu lateral, clique em **Database**.
5. Role até a seção **Connection string**.
6. Clique na aba **URI**.
7. Você verá duas URLs (ou uma). Copie a que está no formato:
   ```
   postgresql://postgres.[abcdefgh]:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```
8. **Substitua `[YOUR-PASSWORD]`** pela senha que você criou ao criar o projeto no Supabase.
   - Se não lembrar a senha: Project Settings → Database → **Reset database password**.
9. **Guarde essa URL.** Você vai usar duas vezes no próximo passo.

---

## PASSO 2 — Criar as duas URLs (DATABASE_URL e DIRECT_URL)

Você precisa de **duas** URLs:

### URL 1 — DATABASE_URL
- Use a URL que você copiou (porta **6543**).
- No **final**, adicione: `?pgbouncer=true&connection_limit=1`
- O `connection_limit=1` é **obrigatório** para Vercel (serverless).
- Se a senha tiver `@`, `#` ou `%`, use **codificação**: `@` → `%40`, `#` → `%23`, `%` → `%25`

### URL 2 — DIRECT_URL
- No Supabase, em **Connection string**, procure por **"Direct connection"** ou **"Session"**.
- Se tiver **Direct connection**: use essa URL (host `db.xxx.supabase.co`, porta 5432).
- Se não tiver: use a **mesma** URL da URL 1, mas troque a porta de `6543` para `5432` e **não** adicione `?pgbouncer=true`.

**Exemplo completo (usando pooler para ambos):**

```
DATABASE_URL = postgresql://postgres.xyz123:MinhaSenha123@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL = postgresql://postgres.xyz123:MinhaSenha123@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
```

---

## PASSO 3 — Abrir o projeto na Vercel

1. Abra **[vercel.com](https://vercel.com)** e faça login.
2. Clique no seu projeto **CAVILIA** (ou o nome que você deu ao deploy).
3. No topo da página, clique em **Settings** (Configurações).

---

## PASSO 4 — Adicionar as variáveis de ambiente

1. No menu lateral esquerdo, clique em **Environment Variables**.
2. Clique em **Add New** (ou **Adicionar**).
3. **Primeira variável:**
   - **Name:** `DATABASE_URL`
   - **Value:** cole a URL 1 (com `?pgbouncer=true` no final.
   - Marque: **Production**, **Preview** e **Development**.
   - Clique em **Save**.
4. Clique em **Add New** de novo.
5. **Segunda variável:**
   - **Name:** `DIRECT_URL`
   - **Value:** cole a URL 2 (porta 5432, sem `?pgbouncer=true`).
   - Marque: **Production**, **Preview** e **Development**.
   - Clique em **Save**.

---

## PASSO 5 — Fazer redeploy

1. No menu lateral, clique em **Deployments**.
2. Na lista de deploys, clique nos **três pontinhos** (⋮) do último deploy.
3. Clique em **Redeploy**.
4. Marque **Use existing Build Cache** (ou deixe como está).
5. Clique em **Redeploy**.
6. Aguarde 1–2 minutos até aparecer **Ready** ou **Completed**.

---

## PASSO 6 — Testar

1. Abra o navegador e acesse: `https://seu-projeto.vercel.app/api/db-check`
   - Substitua `seu-projeto` pelo nome real do seu projeto na Vercel.
2. Deve aparecer algo como:
   ```json
   {"ok":true,"message":"Supabase conectado com sucesso!","tabelas":{"services":5,"bookings":0}}
   ```
3. Se aparecer isso → **funcionou!**
4. Abra o app: `https://seu-projeto.vercel.app`
5. Faça login ou cadastre-se.
6. Vá em **Agendar** → escolha serviço, data, horário → confirme.
7. Deve aparecer **"Agendamento Confirmado!"** e o agendamento deve ficar salvo.

---

## Resumo — Checklist

| # | Passo | Feito? |
|---|-------|--------|
| 1 | Pegar URL do Supabase (Project Settings → Database) | ☐ |
| 2 | Trocar [YOUR-PASSWORD] pela senha real | ☐ |
| 3 | Criar DATABASE_URL (com ?pgbouncer=true) | ☐ |
| 4 | Criar DIRECT_URL (porta 5432) | ☐ |
| 5 | Vercel → Settings → Environment Variables | ☐ |
| 6 | Adicionar DATABASE_URL e DIRECT_URL | ☐ |
| 7 | Redeploy (Deployments → ⋮ → Redeploy) | ☐ |
| 8 | Testar /api/db-check e fazer um agendamento | ☐ |

---

## Se der erro

| Erro | O que fazer |
|------|-------------|
| `db-check` retorna "Variáveis faltando" | As variáveis não estão na Vercel ou não foram aplicadas. Adicione de novo e marque **Production**. Depois: Redeploy. |
| `db-check` retorna erro de conexão | Senha ou URL erradas. Copie de novo do Supabase. Confira se adicionou `connection_limit=1` na DATABASE_URL. |
| `ok: false` ou "relation does not exist" | As tabelas não existem. No seu PC: `npx prisma migrate dev --name init` (com .env.local correto). Depois: Redeploy. |
| Agendamento ainda não salva | 1) Acesse `/api/db-check` — se retornar `ok: true`, o banco está OK. 2) Ao salvar, leia a mensagem de erro no toast (agora mostra o detalhe). 3) Na Vercel: Deployments → último deploy → **Functions** → veja os logs de erro. |
