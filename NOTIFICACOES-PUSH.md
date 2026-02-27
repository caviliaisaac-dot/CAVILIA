# Notificações push — lembrete com mensagem, imagem e som

O app envia **notificação push** no celular quando chega o horário do lembrete: **título**, **mensagem configurável** (com o nome da pessoa), **imagem** e **som** (som padrão do sistema).

---

## O que foi implementado

1. **Mensagem padrão** – No Admin → **Mensagem de Lembrete** você define o texto. Use `{{nome}}`, `{{servico}}`, `{{data}}`, `{{hora}}`. Exemplo:  
   `Olá {{nome}}, seu {{servico}} é {{data}} às {{hora}}.`

2. **Notificação** – Título "Lembrete CAVILIA", corpo = mensagem com o nome (e dados) do cliente, **ícone** (app-icon), **imagem** (emblem).

3. **Som** – O navegador usa o **som padrão de notificação** do celular (não é possível forçar um áudio customizado em todos os casos).

4. **Inscrição** – No **Perfil**, o cliente toca em **"Receber lembretes no celular"** para ativar as notificações. Só depois disso ele passa a receber os lembretes.

---

## Configuração (uma vez)

### 1. Migration

```bash
npx prisma migrate dev --name push_and_scheduled_notifications
```

### 2. Chaves VAPID (push)

No terminal:

```bash
npx web-push generate-vapid-keys
```

Copie **Public Key** e **Private Key**. No `.env.local` (e na Vercel → Environment Variables) adicione:

```env
VAPID_PUBLIC_KEY="sua-public-key-aqui"
VAPID_PRIVATE_KEY="sua-private-key-aqui"
VAPID_MAILTO="mailto:contato@seudominio.com"
```

### 3. Cron (envio dos lembretes)

O **Vercel Cron** chama `/api/cron/send-reminders` a cada minuto (já configurado em `vercel.json`).

Opcional: para proteger a rota, defina na Vercel:

```env
CRON_SECRET="um-token-secreto"
```

Se definir `CRON_SECRET`, quem chamar a URL precisa enviar no cabeçalho:  
`Authorization: Bearer um-token-secreto`. O cron nativo da Vercel não envia esse header; nesse caso deixe `CRON_SECRET` vazio para o cron da Vercel funcionar.

---

## Fluxo

1. Cliente **ativa notificações** no Perfil (inscrição push fica salva no banco).
2. Cliente (ou admin) **cria um agendamento**.
3. O sistema **gera as notificações agendadas** (conforme Configurações de Lembretes) e grava em `scheduled_notifications`.
4. A **cada minuto** o cron chama `/api/cron/send-reminders`, que envia as notificações em atraso para quem tem inscrição.
5. No celular aparece a **notificação** (título, mensagem com nome, imagem) e o **som** padrão do sistema.

---

## Resumo

| Onde configurar | O que faz |
|-----------------|-----------|
| Admin → Mensagem de Lembrete | Texto da notificação (use `{{nome}}`, etc.) |
| Admin → Configurações de Lembretes | Quando avisar (ex.: 15 min, 1 dia antes) |
| Perfil → "Receber lembretes no celular" | Cliente ativa push para o próprio número |
| .env / Vercel | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_MAILTO` |

A mensagem é **uma para todos**; só mudam os dados trocados (nome, serviço, data, hora).
