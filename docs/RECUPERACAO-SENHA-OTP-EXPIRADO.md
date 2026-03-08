# Código de recuperação de senha expira em segundos

Se o usuário recebe o código por e-mail mas, ao digitar, aparece **"Código expirado"** em menos de 1–2 minutos, faça o seguinte.

---

## 1. Aumentar o tempo de validade do código no Supabase

O tempo de expiração do código é definido no **Supabase**, não no app.

1. Abra **[supabase.com](https://supabase.com)** → seu projeto **CAVILIA**.
2. No menu lateral: **Authentication** (Autenticação) → **Providers** (Provedores) → **Email**.
3. Procure a opção **"Email OTP Expiration"** (ou "OTP expiry" / duração do código).
4. O valor está em **segundos**. O padrão é **3600** (1 hora). Se estiver **60** ou muito baixo, o código expira em 1 minuto.
5. Altere para pelo menos **600** (10 minutos) ou **3600** (1 hora). Salve.

Assim o código enviado por e-mail continua válido por mais tempo.

---

## 2. Não clicar no link do e-mail

O e-mail do Supabase pode trazer **link** e **código de 6 dígitos**. Se o usuário (ou o próprio cliente de e-mail) **abrir o link**, o token é usado e o código de 6 dígitos deixa de funcionar (e pode aparecer como "expirado").

Oriente o usuário a **só digitar o código de 6 dígitos** no app e **não clicar no link** do e-mail. Na tela de recuperação de senha já há um aviso nesse sentido.

---

## 3. Solicitar um novo código

Se mesmo assim disser "Código expirado" ou "Código inválido", o usuário pode voltar um passo (botão voltar), manter o e-mail e tocar em **Enviar Código** de novo. Há um limite de um envio a cada 60 segundos; depois disso, um novo código pode ser usado normalmente.

---

**Resumo:** Ajuste **Email OTP Expiration** em **Supabase → Authentication → Providers → Email** para 600 ou 3600 segundos e peça para o usuário usar só o código de 6 dígitos, sem clicar no link do e-mail.
