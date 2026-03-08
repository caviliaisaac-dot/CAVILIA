# Local Rush — como usar e onde está cada erro

O **Local Rush** usa o [localtunnel](https://www.npmjs.com/package/localtunnel) para expor seu `localhost:3000` na internet e testar no celular ou em outro PC.

---

## Como rodar (um comando só)

```bash
npm install
npm run dev:rush
```

- O **servidor** sobe na porta 3000.
- O **túnel** abre e mostra uma URL tipo: `https://xxxx.loca.lt` ou `https://xxxx.localtunnel.me`.
- **Copie essa URL** e abra no navegador (ou celular) para acessar o app.

Para só subir o túnel (com o servidor já rodando noutro terminal):

```bash
npm run rush
```

---

## Onde está cada erro e como consertar

### 1. Erro ao rodar `npm run dev:rush` ou `npm run rush`

| Mensagem | Onde aparece | O que fazer |
|----------|----------------|-------------|
| `'lt' is not recognized` ou `lt: command not found` | Terminal | Rode `npm install` no projeto. O comando `lt` vem do pacote `localtunnel`. |
| `Error: listen EADDRINUSE: address already in use :::3000` | Terminal | A porta 3000 já está em uso. Feche o outro processo que está na 3000 ou use outra porta (veja abaixo). |
| `Error: connection refused` (no túnel) | Terminal do rush | O app ainda não está respondendo na 3000. Espere o Next terminar de compilar (veja o terminal `dev`) e atualize a página do túnel. |

### 2. Erro na tela do app (navegador / celular)

| Mensagem | Onde aparece | Causa e solução |
|----------|----------------|------------------|
| **Erro de conexão. Tente novamente.** | Tela "Recuperar Senha" (ou outra que chama a API) | O navegador não conseguiu falar com o servidor. **Causas comuns:** (1) Você abriu o app por um link que não é o do túnel (ex.: localhost no celular). **Solução:** use a URL que o `npm run rush` mostrou. (2) O servidor caiu ou não está rodando. **Solução:** veja o terminal onde rodou `npm run dev:rush` e reinicie. |
| **Erro de conexão: Failed to fetch** | Tela de recuperar senha (em desenvolvimento) | Mesmo que acima: requisição não chegou no servidor. Use a URL do túnel e confira se o servidor está rodando. |
| **E-mail não encontrado** | Recuperar senha | O e-mail não está cadastrado no banco (o campo e-mail é opcional no cadastro). Cadastre o e-mail no perfil ou crie conta com e-mail. |
| **Erro ao enviar código** | Recuperar senha | O Supabase não conseguiu enviar o e-mail (limite, SMTP ou configuração). Veja o terminal do servidor (Next) para o log `[forgot-password] Supabase OTP error:`. |

### 3. Onde o código trata esses erros (para você ou para eu consertar)

| O que | Arquivo | Trecho |
|-------|---------|--------|
| Mensagem "Erro de conexão" na recuperação de senha | `components/auth-screen.tsx` | Funções `handleForgot` e `handleResetPassword`: bloco `catch` que chama `setError(...)`. |
| Resposta "E-mail não encontrado" | `app/api/users/forgot-password/route.ts` | `return NextResponse.json({ error: "..." }, { status: 404 })`. |
| Erro do Supabase ao enviar OTP | `app/api/users/forgot-password/route.ts` | Depois de `supabase.auth.signInWithOtp`; o `error` é logado e devolvido como 500. |
| Erro de conexão ao carregar dados do perfil | `components/profile-screen.tsx` | Onde chama `setDadosError("Erro de conexão")`. |

---

## Porta 3000 já em uso

Se precisar usar outra porta (ex.: 3001):

1. Altere no `package.json`:
   - em `dev`: `next dev -p 3001 --webpack`
   - em `rush`: `lt --port 3001`
   - em `dev:rush`: mantenha `npm run dev` e `npm run rush` (eles usam os scripts acima).

2. Ou feche o processo na 3000:
   - Windows: `netstat -ano | findstr :3000` e depois `taskkill /PID <número> /F`.
   - Ou feche o terminal onde o Next está rodando.

---

## Resumo

- **Rodar tudo:** `npm install` e `npm run dev:rush`; usar a URL que aparecer no terminal.
- **Erro no terminal:** confira `npm install`, porta 3000 livre e servidor compilado.
- **Erro na tela:** use a URL do túnel, servidor rodando; erros de API estão em `app/api/users/forgot-password/route.ts` e na tela em `components/auth-screen.tsx`.

Se disser qual mensagem de erro aparece e onde (terminal ou tela), dá para apontar o passo exato ou consertar no código.
