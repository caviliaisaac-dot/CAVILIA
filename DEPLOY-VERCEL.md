# Deploy na Vercel não está rodando? Siga estes passos

## 1. Conferir qual repositório está conectado

1. Acesse **[vercel.com](https://vercel.com)** e faça login.
2. Abra o **projeto do CAVILIA** (nome que você deu ao projeto).
3. Vá em **Settings** (Configurações) → **Git**.
4. Veja em **Connected Git Repository**:
   - Se estiver **vazio** ou com outro repositório, o deploy não dispara no push.
   - Deve estar conectado a um destes:
     - `aupontocortes-tech/cavilia`
     - `caviliaisaac-dot/CAVILIA`

## 2. Conectar o repositório (se não estiver conectado)

1. Em **Settings** → **Git**, clique em **Connect Git Repository**.
2. Escolha **GitHub** e autorize se pedir.
3. Selecione o repositório correto (`cavilia` ou `CAVILIA`).
4. Em **Production Branch** deixe **main**.
5. Salve. Os próximos pushes na branch `main` vão disparar deploy automático.

## 3. Disparar um deploy manual agora

1. No projeto, vá na aba **Deployments**.
2. No canto superior direito, clique em **Redeploy** (ou nos três pontinhos do último deploy → **Redeploy**).
3. Marque **Use existing Build Cache** como desmarcado se quiser build do zero.
4. Clique em **Redeploy**.

Assim o app atualiza mesmo que o deploy automático não tenha rodado.

## 4. Se o repositório já estiver conectado mas não deployar

- Em **Settings** → **Git**, confira se **Ignored Build Step** está vazio (ou que o comando não está ignorando todos os commits).
- Em **Settings** → **General**, confira se **Build Command** está como `next build` ou `npm run build` (ou vazio para usar o padrão do Next.js).

## 5. Variáveis de ambiente (importante para o app funcionar)

Em **Settings** → **Environment Variables** confira se existem:

- `DATABASE_URL` (conexão com o Supabase)
- `DIRECT_URL` (conexão direta Supabase)

Use os **mesmos valores** que estão no seu `.env.local` no computador. Depois de salvar, faça um **Redeploy** para aplicar.

---

**Resumo:** Se o push foi feito mas o deploy não rodou, normalmente o projeto na Vercel não está ligado ao repositório certo ou à branch `main`. Conecte o repo em **Settings** → **Git** e use **Redeploy** na aba **Deployments** para atualizar o app agora.
