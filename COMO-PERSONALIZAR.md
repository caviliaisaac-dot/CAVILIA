# Como deixar o app e o ícone do jeito que você quiser

## 1. Trocar o ícone (cavalo e ferradura) no meio da tela

- O ícone que aparece no centro da tela inicial é este arquivo:
  - **`public/images/emblem.png`**
- Para usar **o seu** ícone:
  1. Pegue a imagem que você quer (cavalo + ferradura, fundo preto ou transparente).
  2. Salve ou renomeie para **`emblem.png`**.
  3. Substitua o arquivo que está em **`cavilia/public/images/emblem.png`** por essa nova imagem (apague o antigo e coloque o novo no mesmo lugar, com o mesmo nome).

Não precisa mudar código: o app já está configurado para carregar `/images/emblem.png`. Depois de trocar o arquivo, atualize a página no navegador (Ctrl+F5).

---

## 2. Ajustar o layout da tela inicial

O layout da primeira tela (CAVILIA, Studio Club 1998, ícone, botões) está em:

- **`components/home-screen.tsx`**

Você pode:

- **Querer um print de referência:** tire um print da tela como você quer (ou use um design no Figma/Canva). Envie esse print aqui no chat e peça: “Deixa a tela inicial assim” — aí eu ajusto o código para ficar igual.
- **Ajustar você mesmo:** abra `home-screen.tsx` e altere textos, classes do Tailwind (cores, tamanhos, espaçamentos). Os comentários no arquivo indicam cada bloco (título, tagline, ícone, botões).

---

## 3. Resumo rápido

| O que você quer mudar | Onde fazer |
|------------------------|------------|
| Ícone do meio (cavalo/ferradura) | Trocar o arquivo **`public/images/emblem.png`** pela sua imagem |
| Textos, cores, tamanhos, posição dos botões | Editar **`components/home-screen.tsx`** |
| Barra de baixo (Início, Agendar, Perfil) | Editar **`components/bottom-nav.tsx`** |
| Fundo (couro) | Editar **`app/globals.css`** (classe `.leather-premium-bg`) |

Se você enviar um print ou descrever como quer a tela e o ícone, dá para te passar as alterações exatas no código.
