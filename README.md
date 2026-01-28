# Gestão de Dívidas

Uma aplicação web completa para gerenciamento de dívidas com autenticação, roles de usuário e interface moderna.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Estilo**: TailwindCSS + shadcn/ui
- **Autenticação & Database**: Supabase (PostgreSQL + RLS)
- **Deploy**: Netlify
- **Icons**: Lucide React

### 🎨 **Funcionalidades Implementadas**

#### **Para Usuários:**
- ✅ Cadastro e login
- ✅ Visualizar próprias dívidas
- ✅ Ver detalhes de dívidas
- ✅ Solicitar confirmação de pagamento
- ✅ **Editar perfil (nome e avatar)**
- ✅ **Upload de foto de perfil com preview**
- ✅ **Avatar aparece no header e sidebar**

#### **Para Administradores:**
- ✅ Visualizar todas as dívidas do sistema
- ✅ Criar novas dívidas para usuários
- ✅ Marcar dívidas como pagas/pendentes
- ✅ Aprovar/rejeitar solicitações de pagamento
- ✅ Dashboard com estatísticas gerais

#### **Avatar System:**
- ✅ Upload de imagens (JPG, PNG, WebP)
- ✅ Validação de tamanho (máx 2MB)
- ✅ Preview local antes do upload
- ✅ Cache-buster para evitar imagens antigas
- ✅ Fallback com inicial do nome
- ✅ Organização por usuário no Storage
- ✅ Políticas RLS para segurança

## 🛠️ Setup do Projeto

### 1. Clonar o repositório
```bash
git clone <repository-url>
cd projeto-divida
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar Supabase

#### 3.1 Criar projeto Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e a Anonymous Key

#### 3.2 Executar SQL do Schema
1. No painel do Supabase, vá para **SQL Editor**
2. Copie e cole o conteúdo do arquivo `supabase/schema.sql`
3. Execute o script para criar tabelas, triggers e políticas RLS

#### 3.3 Configurar Storage de Avatares
1. Vá para **Storage** no painel do Supabase
2. Crie um novo bucket chamado `avatars`
3. Configure as políticas de acesso executando o `supabase/storage-policies.sql`

#### 3.4 Configurar Bucket e Policies (Manual)
Se preferir configurar manualmente:

**Criar Bucket:**
- Vá para Storage > Create bucket
- Nome: `avatars`
- Public bucket: `true`

**Executar Policies SQL:**
```sql
-- Copie e cole o conteúdo de supabase/storage-policies.sql
```

**Estrutura de arquivos no Storage:**
```
avatars/
├── {user-id}/
│   ├── 1640995200000.jpg
│   ├── 1640995300000.png
│   └── ...
```

### 4. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_supabase_url
VITE_SUPABASE_ANON_KEY=sua_supabase_anon_key
VITE_ADMIN_EMAILS=admin@exemplo.com
```

### 5. Executar localmente
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 🚀 Deploy no Netlify

### 1. Preparar o repositório
- Faça push do código para um repositório Git
- Certifique-se que o `netlify.toml` está na raiz

### 2. Configurar no Netlify
1. Acesse [netlify.com](https://netlify.com)
2. Conecte seu repositório Git
3. Configure as variáveis de ambiente em **Site settings > Build & deploy > Environment**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAILS` (opcional)

### 3. Deploy
- O Netlify fará o deploy automaticamente
- O site estará disponível em uma URL `.netlify.app`

## 📁 Estrutura do Projeto

```
projeto-divida/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/             # Componentes UI (shadcn/ui)
│   │   ├── AppLayout.tsx   # Layout principal
│   │   └── ProtectedRoute.tsx # Guard de rota
│   ├── contexts/           # Contextos React
│   │   └── AuthContext.tsx # Contexto de autenticação
│   ├── hooks/              # Hooks customizados
│   │   ├── useDebts.ts
│   │   ├── usePaymentRequests.ts
│   │   └── useProfiles.ts
│   ├── lib/                # Utilitários
│   │   ├── supabaseClient.ts
│   │   └── utils.ts
│   ├── pages/              # Páginas da aplicação
│   │   ├── DashboardPage.tsx
│   │   ├── DebtsPage.tsx
│   │   ├── DebtDetailPage.tsx
│   │   ├── RequestsPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── LoginPage.tsx
│   │   └── SignupPage.tsx
│   ├── types/              # Tipos TypeScript
│   │   └── index.ts
│   ├── utils/              # Funções utilitárias
│   │   └── formatCurrency.ts
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Entry point
│   └── index.css           # Estilos globais
├── supabase/
│   └── schema.sql          # Schema do banco de dados
├── public/                 # Arquivos estáticos
├── netlify.toml           # Configuração do Netlify
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## 🔐 Segurança

### Row Level Security (RLS)
O projeto implementa RLS no Supabase para garantir:
- **Usuários** só acessam seus próprios dados
- **Admins** têm acesso a todos os dados
- Políticas validam tanto no frontend quanto no backend

### Roles de Usuário
- **user**: Acesso limitado aos próprios dados
- **admin**: Acesso completo ao sistema

### Variáveis de Ambiente
- Nunca exponha chaves sensíveis no frontend
- Use variáveis de ambiente para configurações

## 🎨 UI/UX

### Design System
- **shadcn/ui**: Componentes modernos e acessíveis
- **TailwindCSS**: Estilização utilitária
- **Lucide React**: Ícones consistentes
- **Design responsivo**: Funciona em desktop e mobile

### Componentes Principais
- Cards para exibição de informações
- Badges para status
- Modais para formulários
- Tabelas para listagens
- Loading states

## 📊 Schema do Banco

### Tabelas Principais
- **profiles**: Informações dos usuários
- **debts**: Dívidas cadastradas
- **payment_requests**: Solicitações de pagamento

### Triggers
- Atualização automática de `updated_at`
- Atualização de status de dívidas ao aprovar requests

### Políticas RLS
- Controle de acesso por usuário
- Validação de roles
- Segurança em nível de linha

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob licença MIT.

## 🆘 Suporte

Se você encontrar algum problema:
1. Verifique o setup do Supabase
2. Confirme as variáveis de ambiente
3. Verifique as políticas RLS
4. Abra uma issue no repositório

## 🚀 Próximos Passos

- [ ] Testes automatizados
- [ ] Notificações por email
- [ ] Exportação de relatórios
- [ ] Integração com gateways de pagamento
- [ ] Histórico detalhado de alterações
