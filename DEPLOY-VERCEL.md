# Deploy na Vercel não está rodando? Siga estes passos

---

## GitHub atualiza mas a Vercel NÃO — como descobrir o erro

O app roda na sua máquina e o código sobe no GitHub, mas **na Vercel o site não atualiza**. Siga este diagnóstico.

### 1. Rodar o diagnóstico no seu PC

No terminal, na pasta do projeto (`c:\Users\bsbth\cavilia`), rode:

```bash
npm run deploy:check
```

O script mostra: **branch atual**, **último commit** (ex.: `abc1234`) e **remotes**. **Anote o último commit** (7 caracteres) para comparar com a Vercel.

### 2. Conferir na Vercel qual repositório e branch estão conectados

1. Abra **[vercel.com](https://vercel.com)** → seu projeto CAVILIA.
2. Clique em **Settings** → no menu lateral em **Git**.
3. Anote:
   - **Connected Git Repository** — ex.: `aupontocortes-tech/cavilia` ou `caviliaisaac-dot/CAVILIA`. O deploy só dispara quando você faz push **nesse** repositório.
   - **Production Branch** — em geral `main`. O deploy só roda quando você faz push **nessa** branch.

Se **Connected Git Repository** estiver vazio ou "Disconnected", a Vercel não faz deploy. Clique em **Connect Git Repository**, escolha o GitHub, selecione o repositório e salve.

### 3. Seu push tem que ir para o mesmo repositório da Vercel

- Vercel conectada em **aupontocortes-tech/cavilia** → use: `git push origin main`
- Vercel conectada em **caviliaisaac-dot/CAVILIA** → use: `git push cavilia-isaac main`

Se você usa `npm run push:all`, os dois repos recebem o código, mas **só o repo conectado na Vercel** dispara deploy.

### 4. Ver se a Vercel recebeu o deploy

1. No projeto Vercel, aba **Deployments**.
2. Veja o deploy mais recente: **Source** (repo + branch), **Commit** (hash) e **data/hora**.
3. O **Commit** deve ser o mesmo que você anotou no passo 1. A **data** deve ser próxima do seu push.

Se **não aparecer deploy novo** após o push: repositório ou branch na Vercel estão diferentes do seu push (volte ao passo 2 e 3). Ou existe **Ignored Build Step** em **Settings → Git** — deixe vazio para testar.

### 5a. GitHub está atualizado mas a Vercel não cria deploy novo

Se você confirmou que o commit está no GitHub (ex.: abrindo https://github.com/caviliaisaac-dot/CAVILIA/commits/main) mas na Vercel não aparece nenhum deploy recente, o problema é a **conexão ou o webhook** entre GitHub e Vercel.

**Tente na ordem:**

1. **Desconectar e reconectar o repositório na Vercel**
   - Vercel → projeto → **Settings** → **Git**.
   - Clique em **Disconnect** no repositório conectado.
   - Depois clique em **Connect Git Repository** → GitHub → escolha **caviliaisaac-dot/CAVILIA** de novo.
   - **Production Branch:** deixe **main**. Salve.
   - Faça um novo push (ou use o Deploy Hook) e veja se aparece deploy na aba **Deployments**.

2. **Conferir webhooks no GitHub**
   - Abra https://github.com/caviliaisaac-dot/CAVILIA/settings/hooks.
   - Veja se existe um webhook da **Vercel** (URL contendo `vercel.com`).
   - Se não existir ou estiver com erro (ícone vermelho), a Vercel não está recebendo o aviso de push. Reconectar o repo na Vercel (passo 1) costuma recriar o webhook.

3. **Dois projetos na Vercel**
   - Se você tem mais de um projeto (ex.: um para aupontocortes-tech/cavilia e outro para caviliaisaac-dot/CAVILIA), confira se está olhando o projeto certo: aquele em que **Connected Git Repository** é **caviliaisaac-dot/CAVILIA**.

4. **Deploy manual (Redeploy)**
   - Em **Deployments**, nos três pontinhos (⋮) do último deploy, clique em **Redeploy**.
   - Isso ao menos atualiza o site com o código que a Vercel já tinha naquele deploy (pode não ser o commit mais novo se o webhook falhou). Para pegar o commit **778f1c4** e os mais novos, o ideal é o passo 1 (reconectar) e um novo push.

Se depois de reconectar ainda não criar deploy automático ao dar push, vale abrir um pedido de suporte na Vercel (Help ou dashboard) informando: projeto conectado a caviliaisaac-dot/CAVILIA, branch main, pushes aparecem no GitHub mas nenhum deploy novo é criado.

### 5. Deploy aparece mas com status **Error**

Clique no deploy com erro → **Build Logs**. A mensagem no final indica a causa (ex.: `DATABASE_URL`, Prisma). Corrija e use **Redeploy**.

### Resumo

| Onde | O que conferir |
|------|-----------------|
| Terminal: `npm run deploy:check` | Branch, último commit, remotes |
| Vercel → Settings → Git | Connected Git Repository + Production Branch |
| Seu push | Para o **mesmo** repo e branch |
| Vercel → Deployments | Deploy novo com o **mesmo** commit do seu push |

Eu não tenho acesso à sua Vercel nem ao GitHub; não consigo fazer o deploy por você. Com esses passos você descobre se o problema é repo/branch errado, Ignored Build Step ou build quebrado, e corrige.

### Ordem certa: push primeiro, deploy depois

A Vercel está conectada em **caviliaisaac-dot/CAVILIA**. O Deploy Hook só **reconstrói** o que já está na branch `main` **nesse** repositório. Se você não der push no **cavilia-isaac**, o GitHub desse repo continua com o código antigo e o deploy não muda nada.

**Faça sempre nesta ordem:**

1. **Enviar o código para o repo que a Vercel usa:**
   ```bash
   git add .
   git commit -m "Atualização"
   git push cavilia-isaac main
   ```
   (Ou `npm run push:all` para enviar aos dois repos.)

2. **Só depois** abrir a URL do Deploy Hook no navegador (ou esperar o deploy automático).

3. Em **Deployments**, conferir se apareceu um deploy **novo** (data/hora de agora). Se aparecer com **Error**, abrir esse deploy e ver o **Build Logs**.

---

## Como verificar o erro — não está atualizando?

Siga na ordem. Em cada passo você descobre **onde** está o problema.

### Passo A — O push subiu mesmo?

No terminal (pasta do projeto):

```bash
git status
```

- Se aparecer **"Your branch is up to date with 'origin/main'"** (ou com `cavilia-isaac/main`), o push já foi feito.
- Se aparecer **"Your branch is ahead of 'origin/main'"** ou arquivos em **Changes not staged** / **Untracked**, você ainda **não** fez commit e/ou push.

Rode o push e veja se dá **erro**:

```bash
git add .
git commit -m "Atualização"
npm run push:all
```

- Se aparecer **erro de autenticação** (403, Permission denied, Authentication failed): sua conta GitHub ou token não tem permissão no repositório. Conceda acesso ou use a conta certa.
- Se aparecer **"Everything up-to-date"**: o código já estava igual no GitHub; não há nada novo para atualizar.
- Se aparecer **"success"** ou contagem de objetos enviados: o push funcionou. Siga para o Passo B.

### Passo B — O GitHub está com o código novo?

1. Abra no navegador:
   - **aupontocortes-tech/cavilia:** https://github.com/aupontocortes-tech/cavilia
   - **caviliaisaac-dot/CAVILIA:** https://github.com/caviliaisaac-dot/CAVILIA
2. Veja a **data do último commit** na página inicial do repositório.
3. Confira se é o commit que você acabou de dar push. Se a data for antiga, o push **não** chegou nesse repo (volte ao Passo A e use o remote certo).

### Passo C — A Vercel disparou o deploy?

1. Acesse **[vercel.com](https://vercel.com)** → seu projeto CAVILIA.
2. Aba **Deployments**.
3. Veja o **deploy mais recente**:
   - **Data/hora:** deve ser próxima do horário do seu push.
   - **Status:** Building → depois **Ready** (verde) ou **Error** (vermelho).

Se **não aparecer deploy novo** depois do push:

- O projeto pode não estar conectado ao repositório que você usou no push. Vá em **Settings → Git** e confira **Connected Git Repository** e **Production Branch** (veja seção abaixo).
- Pode existir **Ignored Build Step** que está impedindo o build. Em **Settings → Git**, veja se há comando em **Ignored Build Step** e deixe vazio para testar.

### Passo D — O build da Vercel falhou?

Se na aba **Deployments** o status estiver **Error** (vermelho):

1. Clique nesse deploy com erro.
2. Abra **Building** ou **Build Logs** (log do build).
3. Role até aparecer a **mensagem em vermelho** ou a última linha antes de parar.

Erros comuns:

| Mensagem (exemplo) | Causa provável | O que fazer |
|-------------------|----------------|-------------|
| `DATABASE_URL` / `DIRECT_URL` not found | Variáveis de ambiente faltando | **Settings → Environment Variables**: adicione `DATABASE_URL` e `DIRECT_URL` (valores do Supabase). Depois **Redeploy**. |
| `Module not found` / `Cannot find module` | Dependência ou caminho errado | Veja o nome do módulo no log. Rode `npm install` no projeto e confira o import no arquivo indicado. |
| `Prisma` / `schema` / `migrate` | Prisma não gerou o client ou migrações | Na Vercel, **Build Command** pode precisar incluir `prisma generate`. Ex.: `npx prisma generate && npm run build`. Ou já está no `postinstall` do package.json. |
| `Command failed` / `Exit code 1` | Erro genérico do build | A linha acima no log costuma ter o comando que falhou. Corrija o que está indicado. |

Depois de corrigir, use **Redeploy** no último deploy (três pontinhos → Redeploy).

### Passo E — O site abre mas não reflete as mudanças?

- **Cache do navegador:** aperte **Ctrl + Shift + R** (ou no celular abra em aba anônima) e teste de novo.
- **Cache da Vercel:** na hora do Redeploy, desmarque **Use existing Build Cache** e clique em **Redeploy** para forçar build do zero.

### Passo F — App instalado (PWA) não atualiza — “continua a versão antiga”

O CAVILIA é um PWA: quando você **instala** o app (ícone na tela inicial), o navegador guarda uma cópia em cache. Mesmo com deploy novo na Vercel, o app instalado pode continuar mostrando a versão antiga até atualizar.

**O que fazer:**

1. **Abrir o site pelo navegador** (não pelo ícone do app): digite a URL do site (ex. `https://seu-app.vercel.app`) na barra do Chrome/Safari.
2. **Esperar o banner amarelo** no topo: **“Nova versão disponível”** → toque em **“Atualizar agora”**. O app recarrega com a versão nova.
3. Se o banner **não aparecer**: feche todas as abas do site, abra de novo a URL no navegador e recarregue (Ctrl+Shift+R ou puxe para atualizar no celular). Às vezes é preciso abrir duas vezes para o Service Worker ver a nova versão.
4. **Conferir se a versão mudou:** no canto inferior esquerdo da tela aparece um **“v abc1234”** (código do commit). Depois do deploy, esse código deve ser **diferente** do anterior. Se mudou, o deploy está no ar; se o app instalado ainda mostra o código antigo, use o passo 1–3 para forçar a atualização.

Resumo: use sempre **“Atualizar agora”** quando o banner aparecer, ou abra o site pelo **navegador** e recarregue para pegar a versão nova.

---

## Por que o push não dispara deploy automático?

Confira, na ordem:

1. **Repositório certo no Git**  
   Você tem dois remotes no projeto:
   - `origin` → `aupontocortes-tech/cavilia`
   - `cavilia-isaac` → `caviliaisaac-dot/CAVILIA`  
   O deploy automático só roda no repositório que está **conectado na Vercel**.  
   - Se a Vercel estiver ligada em **aupontocortes-tech/cavilia**, faça: `git push origin main`.  
   - Se estiver ligada em **caviliaisaac-dot/CAVILIA**, faça: `git push cavilia-isaac main`.

2. **Branch de produção**  
   Na Vercel: **Settings → Git**. Veja qual é a **Production Branch** (geralmente `main`). Só push nessa branch dispara deploy de produção.

3. **Ignored Build Step**  
   Em **Settings → Git**, veja se **Ignored Build Step** está vazio. Se tiver um comando que sempre retorna “não buildar”, o deploy não dispara.

4. **Conexão Git na Vercel**  
   Em **Settings → Git**, em **Connected Git Repository** deve aparecer o repo certo. Se estiver vazio ou “Disconnected”, reconecte (veja passo 2 abaixo).

---

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
