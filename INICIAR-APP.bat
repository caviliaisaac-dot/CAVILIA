@echo off
cd /d "%~dp0"
if not exist package.json (
  echo ERRO: package.json nao encontrado. Execute este arquivo na pasta do projeto.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Instalando dependencias pela primeira vez...
  call npm install
  call npx prisma generate
)
echo Limpando cache antigo...
if exist .next rmdir /s /q .next 2>nul
echo.
echo Iniciando CAVILIA em http://localhost:3000
echo Aguarde "Ready" e o navegador abrira automaticamente.
echo.
start "" http://localhost:3000
call npm run dev
pause
