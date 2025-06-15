# WorkLab - Sistema de Reserva de Espaços e Recursos

Sistema de reserva de espaços e recursos corporativos desenvolvido com Next.js 14, Supabase e Twilio.

## 🚀 Tecnologias

- **Frontend**: Next.js 14 (App Router, Server Components)
- **Backend**: Supabase (Postgres, Auth, Edge Functions)
- **Banco de Dados**: PostgreSQL com Row Level Security
- **Autenticação**: Supabase Auth (Email/Senha, Google, Microsoft)
- **Notificações**: Twilio (WhatsApp, SMS)
- **Tempo Real**: Supabase Realtime
- **Testes**: Vitest, React Testing Library
- **Deploy**: Vercel (Frontend), Supabase Cloud (Backend)

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Conta no Twilio
- Conta no Vercel (opcional)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/worklab.git
cd worklab
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase

# Twilio
TWILIO_ACCOUNT_SID=seu_account_sid_do_twilio
TWILIO_AUTH_TOKEN=seu_auth_token_do_twilio
TWILIO_PHONE_NUMBER=seu_numero_do_twilio
TWILIO_VERIFY_SID=seu_verify_sid_do_twilio
```

4. Configure o banco de dados:
```bash
# Acesse o dashboard do Supabase
# Execute o script SQL em supabase/migrations/20240101000000_initial_schema.sql
```

5. Implante as Edge Functions:
```bash
supabase functions deploy createReservation
supabase functions deploy modifyReservation
supabase functions deploy cancelReservation
supabase functions deploy generateReports
supabase functions deploy webhookTwilioStatus
```

## 🚀 Executando o Projeto

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse `http://localhost:3000`

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes e2e
npm run test:e2e
```

## 📦 Deploy

### Frontend (Vercel)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push na branch main

### Backend (Supabase)

1. Acesse o dashboard do Supabase
2. Configure as variáveis de ambiente
3. Implante as Edge Functions
4. Configure os webhooks do Twilio

## 📝 Funcionalidades

- [x] Autenticação de usuários
- [x] Gestão de recursos (salas, mesas, equipamentos)
- [x] Reserva de recursos com validação de conflitos
- [x] Notificações via WhatsApp/SMS
- [x] Relatórios de utilização
- [x] Logs de auditoria
- [x] Interface responsiva

## 🔒 Segurança

- Row Level Security (RLS) em todas as tabelas
- Autenticação via Supabase Auth
- Validação de dados com Zod
- Proteção contra CSRF
- Headers de segurança configurados

## 📈 Monitoramento

- Logs de auditoria para todas as ações
- Métricas de utilização de recursos
- Status de entrega das notificações
- Monitoramento de erros

