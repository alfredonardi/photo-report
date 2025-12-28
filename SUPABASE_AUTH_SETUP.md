# 🔐 Configuração do Supabase Auth

Este guia mostra como configurar a autenticação do app usando Supabase Auth (sistema moderno e ativamente mantido).

## 📋 Pré-requisitos

Você já deve ter:
- ✅ Projeto criado no Supabase
- ✅ Variáveis de ambiente configuradas (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`)
- ✅ Bucket de storage configurado (já feito para PDFs)

## 🚀 Configuração Passo a Passo

### 1️⃣ Configurar Email Templates (Opcional mas Recomendado)

No Supabase Dashboard:

1. Vá em **Authentication** → **Email Templates**
2. Customize os templates de email (confirmação, reset de senha, etc.)
3. Adicione logo e informações da Polícia Civil se desejar

### 2️⃣ Desabilitar Sign-ups Públicos (IMPORTANTE!)

Para garantir que apenas você pode criar usuários:

1. Vá em **Authentication** → **Providers** → **Email**
2. **DESABILITE** a opção **"Enable email confirmations"** se quiser criar usuários sem precisar confirmar email
3. Ou mantenha habilitado para maior segurança (usuário precisa clicar em link no email)

### 3️⃣ Configurar Políticas de Segurança (RLS)

Execute este SQL no **SQL Editor** do Supabase:

```sql
-- Atualiza políticas da tabela pdf_reports para usar auth.uid()
-- Agora usa Supabase Auth em vez de email

-- Remove políticas antigas (se existirem)
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios PDFs" ON pdf_reports;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios PDFs" ON pdf_reports;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios PDFs" ON pdf_reports;

-- Nova política de INSERT (baseada no user_id do auth)
CREATE POLICY "Usuários autenticados podem inserir PDFs"
ON pdf_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = generated_by);

-- Nova política de SELECT (baseada no user_id do auth)
CREATE POLICY "Usuários autenticados podem ver PDFs"
ON pdf_reports
FOR SELECT
TO authenticated
USING (auth.uid()::text = generated_by);

-- Nova política de UPDATE (baseada no user_id do auth)
CREATE POLICY "Usuários autenticados podem atualizar PDFs"
ON pdf_reports
FOR UPDATE
TO authenticated
USING (auth.uid()::text = generated_by);
```

### 4️⃣ Atualizar Tabela pdf_reports (Opcional)

Se quiser rastrear pelo ID do usuário em vez do email:

```sql
-- Adiciona coluna user_id (opcional, mas recomendado)
ALTER TABLE pdf_reports ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_pdf_reports_user_id ON pdf_reports(user_id);
```

## 👥 Como Criar Usuários (Sistema Invite-Only)

### Opção 1: Via Dashboard do Supabase (Mais Fácil)

1. Vá em **Authentication** → **Users**
2. Clique em **Add User**
3. Preencha:
   - Email do usuário
   - Senha temporária (envie para o usuário de forma segura)
4. Clique em **Create User**
5. ✅ Usuário criado! Ele já pode fazer login

### Opção 2: Via API (Programaticamente)

Se quiser criar uma interface admin no futuro:

```typescript
import { supabase } from './services/supabase/config';

// Apenas admins devem poder fazer isso
async function createUser(email: string, password: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Confirma email automaticamente
  });

  if (error) throw error;
  return data;
}
```

## 🔒 Segurança - Configurações Recomendadas

No Supabase Dashboard → **Authentication** → **Settings**:

- ✅ **Site URL**: `https://seu-app.netlify.app` (URL do seu app em produção)
- ✅ **Redirect URLs**: Adicione URLs permitidas para redirect após login
- ✅ **JWT Expiry**: 3600 (1 hora) ou mais, dependendo da necessidade
- ✅ **Disable Signup**: Certifique-se que está desabilitado se não quer auto-registro

## 📧 Resetar Senha de Usuário

Se um usuário esquecer a senha:

### Via Dashboard:
1. Vá em **Authentication** → **Users**
2. Encontre o usuário
3. Clique nos três pontinhos → **Send Password Reset Email**
4. Usuário receberá email com link para criar nova senha

### Via Código (futuro):
```typescript
await supabase.auth.resetPasswordForEmail(email);
```

## ✅ Verificação Rápida

Após configurar tudo:

1. ✅ Variáveis de ambiente configuradas
2. ✅ Políticas RLS criadas
3. ✅ Sign-up público desabilitado
4. ✅ Pelo menos 1 usuário criado para testar
5. ✅ App fazendo build sem erros

## 🆘 Troubleshooting

### "Invalid login credentials"
- Verifique se o usuário foi criado corretamente no dashboard
- Confirme que o email está correto (sem espaços)
- Tente resetar a senha do usuário

### "Email not confirmed"
- Vá em Authentication → Users
- Encontre o usuário e marque como "confirmed" manualmente
- Ou configure para não exigir confirmação de email

### Erro de CORS
- Adicione a URL do seu app em Settings → API → URL Configuration

## 📚 Documentação Oficial

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Auth with React](https://supabase.com/docs/guides/auth/quickstarts/react)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Pronto!** 🎉 Agora você tem um sistema de autenticação moderno, seguro e que não vai deprecar!
