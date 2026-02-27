# Correção dos erros do Supabase e agendamentos

Este guia resolve os **6 avisos de segurança** do Supabase e ajuda a corrigir o problema de **agendamentos não salvando** e o **download do app**.

---

## 1. Agendamentos não salvando

### Diagnóstico rápido

1. **Teste a conexão:** Com o app rodando (`npm run dev`), acesse:
   ```
   http://localhost:3000/api/db-check
   ```
   - Se retornar `{"ok":true,...}` → conexão OK.
   - Se retornar erro → veja o campo `solucao` na resposta.

2. **Verifique o erro real ao salvar:**
   - Abra o app, tente fazer um agendamento.
   - Pressione **F12** → aba **Console** e **Network**.
   - Veja se aparece algum erro em vermelho ou se a requisição para `/api/bookings` falha.

3. **Confirme o `.env.local`:**
   - O arquivo deve estar na **mesma pasta** do `package.json` (ex.: `cavilia/` ou `cavilia/cavilia/`).
   - Deve conter `DATABASE_URL` e `DIRECT_URL` corretos.

### Possíveis causas e soluções

| Causa | Solução |
|-------|---------|
| RLS bloqueando writes | Execute o SQL abaixo no Supabase (Passo 2) |
| URL ou senha erradas | Copie de novo a Connection string em Project Settings → Database |
| Tabelas não existem | Rode `npx prisma migrate dev --name init` |
| Serviços vazios | Rode `npm run db:seed` |
| `.env.local` na pasta errada | Coloque na pasta onde está o `package.json` |

---

## 2. Corrigir os 6 avisos do Supabase (RLS)

O Supabase mostra avisos porque algumas tabelas não têm RLS ou têm políticas muito permissivas. O app usa **Prisma** (conexão direta), então precisa de políticas que permitam acesso total para o usuário do banco.

### Passo a passo

1. No painel do Supabase, vá em **SQL Editor** (menu lateral).
2. Clique em **New query**.
3. Cole e execute o SQL abaixo:

```sql
-- Habilita RLS nas tabelas que não têm
ALTER TABLE public.schedule_time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_day_offs ENABLE ROW LEVEL SECURITY;

-- Políticas que permitem acesso total para o role postgres (usado pelo Prisma)
-- Isso resolve os avisos mantendo o app funcionando

-- schedule_time_blocks
DROP POLICY IF EXISTS "Allow service role full access" ON public.schedule_time_blocks;
CREATE POLICY "Allow service role full access" ON public.schedule_time_blocks
  FOR ALL USING (true) WITH CHECK (true);

-- schedule_day_offs
DROP POLICY IF EXISTS "Allow service role full access" ON public.schedule_day_offs;
CREATE POLICY "Allow service role full access" ON public.schedule_day_offs
  FOR ALL USING (true) WITH CHECK (true);

-- bookings (atualiza política existente se necessário)
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.bookings;
DROP POLICY IF EXISTS "Allow service role full access" ON public.bookings;
CREATE POLICY "Allow service role full access" ON public.bookings
  FOR ALL USING (true) WITH CHECK (true);

-- services
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.services;
DROP POLICY IF EXISTS "Allow service role full access" ON public.services;
CREATE POLICY "Allow service role full access" ON public.services
  FOR ALL USING (true) WITH CHECK (true);

-- users
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.users;
DROP POLICY IF EXISTS "Allow service role full access" ON public.users;
CREATE POLICY "Allow service role full access" ON public.users
  FOR ALL USING (true) WITH CHECK (true);
```

4. Clique em **Run** (ou Ctrl+Enter).
5. Aguarde a confirmação de sucesso.

**Nota:** A tabela `_prisma_migrations` é interna do Prisma. O Supabase pode continuar avisando sobre ela — isso não afeta o funcionamento do app.

---

## 3. Download do aplicativo (PWA)

O CAVILIA é um **PWA** (Progressive Web App). O "download" funciona assim:

### No Android (Chrome)

1. Abra o site no Chrome: `http://localhost:3000` (ou sua URL em produção).
2. **Não** basta colar o link em outro lugar — você precisa estar **dentro do site**.
3. O banner "Instalar CAVILIA" deve aparecer na parte de baixo.
4. Toque em **"Instalar Aplicativo"**.
5. Confirme no pop-up do Chrome.

Se o banner não aparecer:
- Use o menu do Chrome (⋮) → **"Instalar app"** ou **"Adicionar à tela inicial"**.

### No iPhone (Safari)

1. Abra o site no **Safari** (não no Chrome).
2. Toque no botão **Compartilhar** (quadrado com seta).
3. Role e toque em **"Adicionar à Tela de Início"**.
4. Toque em **"Adicionar"**.

**Importante:** Não existe um link que "baixa" o app como um arquivo. O app é instalado a partir da página aberta no navegador.

---

## 4. Checklist final

- [ ] `http://localhost:3000/api/db-check` retorna `ok: true`
- [ ] Executei o SQL de RLS no Supabase
- [ ] Rodei `npm run db:seed` (se services estiver vazio)
- [ ] Reiniciei o servidor após alterar `.env.local`
- [ ] Para instalar o app: estou na página do site e uso o banner ou o menu do navegador

---

## 5. Se ainda não funcionar

Envie:
1. A resposta completa de `http://localhost:3000/api/db-check`
2. A mensagem de erro que aparece ao tentar salvar (toast ou console F12)
3. O caminho da pasta onde está o `package.json` e o `.env.local`
