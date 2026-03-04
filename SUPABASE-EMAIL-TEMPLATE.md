# Template de e-mail no Supabase — recuperação de senha

O app usa o código de **6 dígitos** que o Supabase envia. Por padrão o e-mail vem só com um link; é preciso ajustar o template para **mostrar o código** e evitar que o usuário clique no link (no celular o link pode abrir "localhost" e dar erro).

## Onde configurar

1. Acesse o **painel do Supabase**: https://supabase.com/dashboard  
2. Abra seu projeto  
3. Menu **Authentication** → **Email Templates**  
4. Selecione **Magic Link** (é esse que o "Esqueci minha senha" usa)

## Cole este conteúdo no template

Substitua todo o conteúdo do template pelo texto abaixo. O importante é ter **`{{ .Token }}`** — é o código de 6 dígitos.

```html
<h2 style="color: #d4a017; text-align: center;">Cavilia — Recuperação de senha</h2>
<p style="text-align: center;">Use o código abaixo no aplicativo para redefinir sua senha:</p>
<p style="text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px; background: #f5f5f5; border-radius: 10px; margin: 20px 0;">{{ .Token }}</p>
<p style="text-align: center; color: #666; font-size: 14px;">Não é necessário clicar em nenhum link. Digite este código no app.</p>
<p style="text-align: center; color: #999; font-size: 12px;">Este código expira em 1 hora. Se você não solicitou, ignore este e-mail.</p>
```

Depois clique em **Save**.

## Resumo

- **Magic Link** = template usado quando o usuário pede "Esqueci minha senha".
- **`{{ .Token }}`** = código de 6 dígitos que o usuário deve digitar no app.
- O link que o Supabase coloca no e-mail pode abrir "localhost" no celular e dar erro — por isso oriente a usar **só o código**, não o link.
