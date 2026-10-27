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
