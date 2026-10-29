# Derma Check

Aplicativo mobile para registrar observações da pele e organizar informações para consultas dermatológicas.

> ⚠️ **Aviso importante:** o Derma Check é uma ferramenta de apoio e organização. Ele **não substitui diagnóstico, tratamento ou atendimento médico**. Diante de qualquer alteração suspeita na pele, procure um dermatologista.

## Sumário

- [Visão geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Primeiros passos](#primeiros-passos)
- [Configuração do banco de dados (MySQL)](#configuração-do-banco-de-dados-mysql)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Executando o projeto](#executando-o-projeto)
- [Validando a instalação](#validando-a-instalação)
- [API de autenticação](#api-de-autenticação)
- [Contas de teste](#contas-de-teste)
- [Scripts disponíveis](#scripts-disponíveis)
- [Solução de problemas](#solução-de-problemas)
- [Como contribuir](#como-contribuir)

## Visão geral

O Derma Check permite que o usuário acompanhe e registre observações sobre a pele ao longo do tempo, reunindo informações úteis para levar a uma consulta dermatológica. O projeto é dividido em duas partes:

| Pasta | Descrição |
| --- | --- |
| `frontend/` | Aplicativo Expo Router para Android, iOS e web |
| `backend/` | API Express em TypeScript com acesso ao MySQL |

## Tecnologias

- **Frontend:** Expo Router (React Native), com suporte a Android, iOS e web
- **Backend:** Node.js, Express e TypeScript
- **Banco de dados:** MySQL 8
- **Autenticação:** JWT

## Estrutura do projeto

```text
derma-check/
├── frontend/              # App Expo Router
│   └── .env.example       # Modelo de configuração do app
├── backend/               # API Express + TypeScript
│   ├── database/
│   │   └── schema.sql     # Criação do banco e das tabelas
│   ├── src/
│   └── .env.example       # Modelo de configuração da API
└── README.md
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS) e npm
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) 8 e, opcionalmente, o MySQL Workbench
- [Git](https://git-scm.com/)
- Para testar em dispositivo físico: celular na mesma rede Wi-Fi do computador

## Primeiros passos

1. Clone o repositório e acesse a pasta do projeto.
2. Instale as dependências de cada pacote:

   ```bash
   npm install --prefix frontend
   npm install --prefix backend
   ```

3. Configure o banco de dados e as variáveis de ambiente (seções a seguir).
4. Inicie o backend e o frontend (veja [Executando o projeto](#executando-o-projeto)).

## Configuração do banco de dados (MySQL)

1. **Inicie o MySQL.** Confirme que ele está ouvindo na porta `3306`. O banco precisa estar disponível na mesma máquina do backend.
2. **Crie o banco e as tabelas.** No MySQL Workbench, abra `backend/database/schema.sql` e execute o script. Ele cria o banco `derma_check` e a tabela `usuarios`. O script pode ser executado novamente sem apagar registros existentes.
3. **Crie o arquivo de ambiente do backend** (PowerShell):

   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

   Em Linux/macOS:

   ```bash
   cp backend/.env.example backend/.env
   ```

4. **Edite `backend/.env`** com as credenciais da sua instalação (veja a tabela abaixo). Troque o `JWT_SECRET` por um segredo longo e aleatório.

> 🔒 Nunca compartilhe nem versione o arquivo `.env`.

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável | Descrição | Exemplo |
| --- | --- | --- |
| `DB_HOST` | Endereço do servidor MySQL | `localhost` |
| `DB_PORT` | Porta do MySQL | `3306` |
| `DB_USER` | Usuário do MySQL | `root` |
| `DB_PASSWORD` | Senha do MySQL | *(sua senha)* |
| `DB_NAME` | Nome do banco | `derma_check` |
| `JWT_SECRET` | Segredo usado para assinar os tokens | *(string longa e aleatória)* |

### Frontend (`frontend/.env`)

Copie `frontend/.env.example` para `frontend/.env` e ajuste `EXPO_PUBLIC_API_URL` conforme o ambiente:

| Ambiente | Valor de `EXPO_PUBLIC_API_URL` |
| --- | --- |
| Web ou simulador iOS | `http://localhost:3000` |
| Emulador Android | `http://10.0.2.2:3000` |
| Celular físico (mesma rede Wi-Fi) | `http://<IP-local-do-computador>:3000` |

> Para usar um celular físico, o firewall do computador deve permitir conexões na porta `3000`.

## Executando o projeto

Em terminais separados:

```bash
npm run dev:backend
npm run dev:frontend
```

## Validando a instalação

1. Acesse `http://localhost:3000/health`. A resposta `status: "OK"` confirma que a API está ativa.
2. Crie uma conta pelo app (ou via `POST /api/auth/register`) e entre com o mesmo e-mail e senha (ou via `POST /api/auth/login`). O primeiro cadastro ou login também testa a conexão com o MySQL.

## API de autenticação

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Verifica se a API está ativa |
| `POST` | `/api/auth/register` | Cadastra um novo usuário |
| `POST` | `/api/auth/login` | Autentica um usuário |

> **Perfis:** o cadastro aceita o perfil `PACIENTE`, que é convertido internamente para `CLIENTE`.

## Contas de teste

Contas disponíveis **apenas para desenvolvimento local**:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Paciente | `paciente.teste@dermacheck.com` | `Senha123` |
| Médico | `medico.teste@dermacheck.com` | `Senha123` |

> ⚠️ Nunca use essas credenciais em ambientes de produção ou homologação acessíveis publicamente.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev:frontend` | Inicia o app em modo de desenvolvimento |
| `npm run dev:backend` | Inicia a API em modo de desenvolvimento |
| `npm run lint` | Executa a verificação de código |
| `npm run build:frontend` | Gera o build do frontend |
| `npm run build:backend` | Gera o build do backend |

Antes de abrir um Pull Request, execute:

```bash
npm run lint
npm run build:frontend
npm run build:backend
```

## Solução de problemas

Se o cadastro ou login falhar, confira nesta ordem:

1. O terminal do backend mostra algum erro?
2. As credenciais em `backend/.env` estão corretas?
3. O script `schema.sql` foi executado?
4. O MySQL está ativo na porta `3306`?
5. O `EXPO_PUBLIC_API_URL` do frontend aponta para o endereço certo para o seu ambiente?
6. (Celular físico) O firewall permite a porta `3000`?

## Como contribuir

Não faça commit diretamente em `master` nem envie alterações para a branch de outra pessoa. Use uma branch própria para cada tarefa e abra um Pull Request.

1. **Atualize sua base e confira o estado do repositório:**

   ```bash
   git status
   git fetch origin
   git log --oneline HEAD..origin/master
   ```

   Se o último comando listar commits novos, atualize sua base antes de começar. Caso tenha alterações locais pendentes, preserve-as primeiro (em uma branch ou commit próprio).

2. **Crie uma branch** com um nome descritivo:

   ```bash
   git switch -c fix/nome-da-correcao
   ```

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
3. **Prepare apenas o que pertence à tarefa.** Evite `git add .`:

   ```bash
   git add caminho/do/arquivo
   git add -p            # selecione apenas os trechos relevantes
   git diff --cached     # revise antes de commitar
   ```

4. **Faça o commit e envie a branch:**

   ```bash
   git commit -m "fix(backend): descreve a alteração"
   git push -u origin fix/nome-da-correcao
   ```

5. **Abra um Pull Request** para `master` (a branch de integração atual). Se a equipe combinar outro destino, como `feat/auth-backend`, confirme a branch-base antes de abrir o PR.

Boas práticas:

- Quem for responsável pelo backend deve puxar as alterações pelo Pull Request, sem compartilhar a mesma branch para commits simultâneos.
- Antes de começar outra tarefa, atualize a branch de destino e crie uma nova branch.
- Se houver conflito (duas pessoas editando as mesmas linhas), resolvam e validem novamente antes do merge.

### Convenção de commits

Sugestão de prefixos: `feat`, `fix`, `docs`, `refactor`, `chore`. Exemplo: `fix(backend): documenta e prepara banco MySQL local`.

---

**Lembrete:** o Derma Check não realiza diagnósticos. Consulte sempre um profissional de saúde.
