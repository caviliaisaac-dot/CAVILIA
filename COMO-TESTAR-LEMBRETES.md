# Como testar a área de lembretes

## 1. Aplicar a migration (uma vez)

No terminal, na pasta do projeto:

```bash
npx prisma migrate dev --name reminder_dias_horas_minutos
```

Se a migration já tiver sido aplicada, o comando informará. Isso cria as colunas **quantidade_dias**, **quantidade_horas** e **quantidade_minutos** na tabela `reminder_settings`.

---

## 2. Onde configurar os lembretes

1. Abra o app (localhost ou Vercel).
2. Entre na área **Admin** (senha do admin).
3. Abra **Configurações de Lembretes** (ícone de sino ou menu).
4. Você verá:
   - **Um tipo** – lembrete simples: só Dias, ou só Horas, ou só Minutos (ex.: “2 horas antes”).
   - **Dias, horas e minutos** – lembrete composto: pode marcar dias + horas + minutos ao mesmo tempo (ex.: “1 dia, 2 horas e 15 minutos antes”).

---

## 3. Como os lembretes são usados

- Ao **criar um agendamento**, o sistema calcula os horários de envio com base nas configurações ativas.
- Os lembretes são preparados para **notificações push** (integração com Firebase). O envio real depende da integração com Firebase estar configurada.
- Para **testar só a lógica** (sem push):
  1. Crie um lembrete ativo (ex.: 15 minutos antes).
  2. Crie um agendamento para daqui a 1 hora.
  3. No servidor (logs do `npm run dev` ou da Vercel), deve aparecer algo como: `[bookings] Lembretes agendados: <id> [...]` com o horário calculado.

---

## 4. Teste rápido no código

- **API:** `GET /api/reminder-settings` – lista todas as configurações.
- **Criar lembrete composto:**  
  `POST /api/reminder-settings` com body:  
  `{ "dias": 1, "horas": 2, "minutos": 15, "ativo": true }`
- **Criar lembrete simples:**  
  `POST /api/reminder-settings` com body:  
  `{ "unidade": "hour", "quantidade": 2, "ativo": true }`

---

## 5. Resumo

| O que fazer | Onde |
|-------------|------|
| Marcar dias, horas e minutos | Configurações de Lembretes → **Dias, horas e minutos** → preencher Dias, Horas e Minutos → Salvar |
| Ver se o lembrete foi calculado | Fazer um agendamento e ver os logs do servidor |
| Envio real de push | Depende da integração com Firebase (Cloud Messaging / Cloud Functions). |
