# Derma Check

Aplicação mobile para registrar observações da pele e organizar informações para consultas
dermatológicas. O aplicativo não substitui diagnóstico ou atendimento médico.

## Estrutura

- `frontend/`: aplicativo Expo Router para Android, iOS e web.
- `backend/`: API Express em TypeScript e configuração de acesso ao MySQL.

## Desenvolvimento

Instale as dependências de cada pacote:

```bash
npm install --prefix frontend
npm install --prefix backend
```

Inicie os serviços em terminais separados:

```bash
npm run dev:frontend
npm run dev:backend
```

## Banco de dados local (MySQL)

1. Instale e inicie o MySQL Server (por exemplo, MySQL 8) e confirme que ele está
   ouvindo na porta `3306`. O banco precisa estar disponível na mesma máquina do
   backend.
2. Crie a tabela usada pela API. No MySQL Workbench, abra
   `backend/database/schema.sql` e execute o script. Ele cria o banco
   `derma_check` e a tabela `usuarios`; pode ser executado novamente sem apagar
   registros existentes.
3. Crie o arquivo de configuração local do backend no PowerShell:

   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

   Edite `backend\.env` e informe `DB_HOST`, `DB_USER`, `DB_PASSWORD`,
   `DB_NAME=derma_check` e `DB_PORT=3306` conforme sua instalação. Troque também
   `JWT_SECRET` por um segredo longo e aleatório. Não compartilhe nem versione
   esse arquivo.
4. Configure `frontend\.env` a partir de `frontend\.env.example`. Use
   `http://localhost:3000` para Web/iOS Simulator, `http://10.0.2.2:3000` para o
   emulador Android e `http://<IP-local-do-computador>:3000` para um celular na
   mesma rede Wi-Fi. O firewall do computador deve permitir a conexão na porta
   `3000`.
5. Instale as dependências, se ainda não o fez, e inicie o backend:

   ```powershell
   npm install --prefix backend
   npm run dev:backend
   ```

   Em outro terminal, inicie o app com `npm install --prefix frontend` (se
   necessário) e `npm run dev:frontend`. Acesse `http://localhost:3000/health`;
   a resposta `status: "OK"` confirma que a API está ativa. O primeiro cadastro
   ou login também testa a conexão com o MySQL.
6. Para validar o fluxo, crie uma conta no app (ou envie uma requisição para
   `POST /api/auth/register`) e entre com o mesmo e-mail e senha em
   `POST /api/auth/login`. A API aceita `PACIENTE` no cadastro e o converte para
   `CLIENTE` internamente. Se houver erro, confira o terminal do backend, as
   credenciais do `.env`, se o schema foi executado e se a URL do frontend aponta
   para o endereço correto.

## Validação

```bash
npm run lint
npm run build:frontend
npm run build:backend
```

Para configurar o backend, copie `backend/.env.example` para `backend/.env` e preencha
as credenciais locais. O arquivo `.env` não deve ser versionado.

Para configurar o frontend, copie `frontend/.env.example` para `frontend/.env` e ajuste
`EXPO_PUBLIC_API_URL` conforme o ambiente. O emulador Android usa `10.0.2.2`, enquanto
um dispositivo físico precisa do IP local da máquina. A API de autenticação usa
`POST /api/auth/register` e `POST /api/auth/login`.

## Commit e envio das alterações

Não faça commit diretamente em `master` nem envie alterações direto para a branch de
outra pessoa. Neste checkout, `master` estava alinhada a `origin/master` e já existem
alterações locais no frontend. Confira o estado antes de começar:

```bash
git status
git fetch origin
git log --oneline HEAD..origin/master
```

Se o último comando não listar commits e você quiser manter as alterações locais nesta
tarefa, crie a branch a partir do checkout atual:

```bash
git switch -c fix/backend-db-setup
```

Revise o diff e prepare apenas o que pertence a esta correção. Não use `git add .`:

```bash
git add README.md backend/database/schema.sql backend/src/controllers/authController.ts
git add -u -- frontend/src/services/api.ts
git add -p
git diff --cached
git commit -m "fix(backend): documenta e prepara banco MySQL local"
git push -u origin fix/backend-db-setup
```

No `git add -p`, inclua somente os trechos relacionados ao conserto e deixe de fora
as alterações locais de outras telas. Se `git fetch` mostrar commits novos em
`origin/master`, não tente atualizar a branch com alterações locais pendentes:
preserve primeiro essas alterações (por exemplo, em uma branch/commit próprio) e
atualize a base antes de abrir a branch de correção.

Abra um Pull Request de `fix/backend-db-setup` para `master`, a branch de integração
atual. O responsável pelo backend deve puxar a alteração pelo Pull Request, sem
compartilhar a mesma branch para commits simultâneos. Se a equipe combinar outro
destino, como `feat/auth-backend`, confirme a branch-base antes de abrir o Pull
Request. Antes de começar outra tarefa, atualize a branch de destino e crie uma nova
branch. Isso reduz divergências, mas conflitos ainda podem ocorrer se duas pessoas
editarem as mesmas linhas; nesse caso, resolvam o conflito e validem novamente antes
do merge.

---

## 🗄️ Configuração do Banco de Dados e Usuários de Teste

Para garantir que todos os desenvolvedores utilizem a mesma estrutura de banco de dados e possuam acesso aos usuários padrão para testes (Paciente e Profissional), siga os passos abaixo.

### 1. Atualizar o Repositório Local

No terminal do VS Code, puxe as últimas alterações da branch principal:

```bash
git checkout main
git pull origin main

### 2. Instalar as Depend~encias do Back-end
Caso novas bibliotecas de banco tenham sido adicionadas, atualize a pasta do servidor:

cd backend
npm install

### 3. Criar os Usuários Globais
npm run seed

Credenciais Padrão para Testes

PERFIL      | E-mail                        | SENHA
Paciente    | paciente.teste@dermacheck.com | Senha123
Médico      | medico.teste@dermacheck.com   | Senha123
## 🗄️ Configuração e Atualização do Banco de Dados

Sempre que a estrutura do banco for modificada ou você precisar recriar as tabelas e usuários de teste localmente, siga estes passos no terminal do VS Code:

### 1. Criar/Atualizar as Tabelas (`schema.sql`)
Acesse a pasta do backend e execute o script automático que lê o arquivo `schema.sql` e cria todas as tabelas no MySQL:

```bash
cd backend
npm run db:setup

### 2. Popular o Banco com Usuários e Dados de Teste(seed.ts)

Para criar os usuários globais de teste (Paciente e Médico) juntamente com registros de exemplo: npm run seed
