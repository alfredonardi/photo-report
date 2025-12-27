# ☁️ Configuração do Supabase - Backup Automático de PDFs

Este guia explica como configurar o **backup automático** de PDFs na nuvem usando Supabase.

## 🎯 O que Isso Faz?

Quando alguém gera um PDF, o sistema **automaticamente**:
- ✅ Envia o PDF para a nuvem (Supabase Storage)
- ✅ Salva metadados (BO, versão, grupo, quem gerou, quando, etc)
- ✅ Tudo em segundo plano (usuário nem percebe)
- ✅ Não bloqueia se falhar (usuário sempre consegue baixar o PDF)

**Benefícios:**
- 📊 Histórico completo de todos os relatórios
- 🔍 Buscar por BO, data, usuário
- 👤 Rastreabilidade (quem gerou o quê)
- ☁️ Backup automático
- 🆓 Grátis até 1GB (suficiente para ~2.000 PDFs)

---

## 📋 Pré-requisitos

- ✅ App já publicado no Netlify
- ✅ Netlify Identity já configurado

---

## 🚀 Passo a Passo

### **1️⃣ Criar Conta no Supabase** (5 minutos)

1. Acesse: https://supabase.com
2. Clique em **"Start your project"**
3. Faça login com GitHub (ou email)
4. Clique em **"New project"**
5. Preencha:
   - **Organization**: Crie uma nova ou use existente
   - **Project name**: `photo-report` (ou qualquer nome)
   - **Database password**: Crie uma senha forte (guarde ela!)
   - **Region**: Escolha `South America (São Paulo)` (mais perto = mais rápido)
   - **Pricing plan**: **Free** ✅
6. Clique em **"Create new project"**
7. ⏳ Aguarde 2-3 minutos enquanto cria o projeto

---

### **2️⃣ Criar Storage Bucket** (2 minutos)

1. No menu lateral do Supabase, clique em **Storage**
2. Clique em **"New bucket"**
3. Preencha:
   - **Name**: `pdfs` (exatamente assim!)
   - **Public bucket**: ✅ Marque como **público**
4. Clique em **"Create bucket"**

✅ **Pronto!** O bucket para armazenar PDFs foi criado.

---

### **3️⃣ Criar Tabela de Metadados** (3 minutos)

1. No menu lateral, clique em **SQL Editor**
2. Clique em **"New query"**
3. Cole o código abaixo:

```sql
-- Cria tabela para armazenar metadados dos PDFs
CREATE TABLE pdf_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  bo_number TEXT NOT NULL,
  version TEXT NOT NULL,
  group_number TEXT NOT NULL,
  photo_count INTEGER NOT NULL,
  generated_by TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria índices para buscas rápidas
CREATE INDEX idx_pdf_reports_bo_number ON pdf_reports(bo_number);
CREATE INDEX idx_pdf_reports_generated_by ON pdf_reports(generated_by);
CREATE INDEX idx_pdf_reports_generated_at ON pdf_reports(generated_at DESC);

-- Habilita Row Level Security (RLS) para segurança
ALTER TABLE pdf_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem inserir (upload)
CREATE POLICY "Permitir insert para todos"
  ON pdf_reports FOR INSERT
  WITH CHECK (true);

-- Policy: Todos podem ler (buscar)
CREATE POLICY "Permitir select para todos"
  ON pdf_reports FOR SELECT
  USING (true);

-- Comentários para documentação
COMMENT ON TABLE pdf_reports IS 'Armazena metadados dos relatórios fotográficos gerados';
COMMENT ON COLUMN pdf_reports.file_path IS 'Caminho do arquivo no Storage';
COMMENT ON COLUMN pdf_reports.bo_number IS 'Número do Boletim de Ocorrência';
COMMENT ON COLUMN pdf_reports.generated_by IS 'Email do usuário que gerou o relatório';
```

4. Clique em **"Run"** (ou pressione Ctrl+Enter)
5. Deve aparecer **"Success. No rows returned"**

✅ **Tabela criada com sucesso!**

---

### **4️⃣ Pegar as Chaves do Supabase** (1 minuto)

1. No menu lateral, clique em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Você verá duas informações importantes:

**Project URL:**
```
https://xxxxxxxxxxxxx.supabase.co
```
📋 Copie essa URL (você vai precisar)

**Anon/Public Key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```
📋 Copie essa chave também

⚠️ **NÃO copie a "service_role" key!** Use apenas a **anon/public key**.

---

### **5️⃣ Configurar no Netlify** (2 minutos)

1. Acesse: https://app.netlify.com
2. Selecione seu site (photoreport)
3. Vá em **Site settings** → **Environment variables**
4. Clique em **"Add a variable"**
5. Adicione **duas variáveis**:

**Variável 1:**
- **Key**: `VITE_SUPABASE_URL`
- **Value**: Cole a **Project URL** que você copiou
- **Scopes**: Marque **"Same value for all deploy contexts"**

**Variável 2:**
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: Cole a **Anon/Public Key** que você copiou
- **Scopes**: Marque **"Same value for all deploy contexts"**

6. Clique em **"Save"**

✅ **Variáveis configuradas!**

---

### **6️⃣ Fazer Deploy** (1 minuto)

As variáveis de ambiente só ficam disponíveis após um novo deploy:

1. Volte para a aba **Deploys**
2. Clique em **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Aguarde o deploy terminar (~2 minutos)

✅ **Deploy concluído!** O backup automático agora está ativo!

---

## 🧪 Como Testar

1. Acesse seu app
2. Faça login
3. Crie um relatório com fotos
4. Gere o PDF

**No console do navegador (F12), você deve ver:**
```
☁️ Iniciando upload do PDF para a nuvem...
✅ PDF enviado para nuvem: relatorios/AB1234_25_v1_1735678901234.pdf
✅ Metadados salvos com sucesso!
```

**No Supabase:**
1. Vá em **Storage** → **pdfs** → pasta `relatorios`
2. Deve aparecer o PDF lá! 🎉
3. Vá em **Table Editor** → **pdf_reports**
4. Deve aparecer uma linha com os metadados! 🎉

---

## 📊 Verificar Histórico de PDFs

Você pode consultar os PDFs salvos de várias formas:

### **Pelo SQL Editor do Supabase:**

```sql
-- Ver todos os PDFs
SELECT * FROM pdf_reports ORDER BY generated_at DESC;

-- Buscar por BO
SELECT * FROM pdf_reports WHERE bo_number = 'AB1234/25';

-- Ver PDFs de um usuário
SELECT * FROM pdf_reports WHERE generated_by = 'usuario@email.com';

-- Estatísticas
SELECT
  COUNT(*) as total_pdfs,
  SUM(file_size) as total_bytes,
  COUNT(DISTINCT bo_number) as unique_bos
FROM pdf_reports;
```

---

## 🔧 Solução de Problemas

### **PDFs não estão sendo salvos**

1. Verifique o console do navegador (F12):
   - Se aparecer: `⚠️ Supabase não configurado` → Variáveis não foram configuradas no Netlify
   - Se aparecer erro de upload → Verifique se o bucket `pdfs` existe e é público

2. Verifique as variáveis de ambiente no Netlify:
   - Site Settings → Environment variables
   - Devem existir `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

3. Faça um novo deploy:
   - Netlify → Deploys → Trigger deploy → Clear cache and deploy

### **Erro "relation pdf_reports does not exist"**

A tabela não foi criada. Volte ao **Passo 3** e execute o SQL novamente.

### **Erro ao fazer upload para storage**

1. Verifique se o bucket `pdfs` existe (Storage → pdfs)
2. Verifique se o bucket é **público**
3. Tente recriar o bucket

---

## 💰 Custos e Limites

**Plano Gratuito do Supabase:**
- ✅ 1 GB de storage (suficiente para ~2.000 PDFs de 500KB)
- ✅ 50.000 rows na tabela (suficiente para muito tempo)
- ✅ 2 GB de transferência/mês
- ✅ Sem limite de tempo

**Se passar do limite:**
- Plano Pro: $25/mês (10 GB de storage)
- Ou deletar PDFs antigos periodicamente

**Para 20-30 usuários gerando ~100 PDFs/mês:**
- Uso estimado: ~50 MB/mês
- **Grátis para sempre!** 🎉

---

## 🎓 Resumo Rápido

1. ✅ Criar conta no Supabase
2. ✅ Criar bucket `pdfs` (público)
3. ✅ Executar SQL para criar tabela `pdf_reports`
4. ✅ Copiar URL e Anon Key
5. ✅ Adicionar variáveis no Netlify
6. ✅ Fazer novo deploy
7. ✅ Testar gerando um PDF

**Tempo total: ~15 minutos**

---

## 🚀 Próximos Passos (Futuro)

Futuramente você pode adicionar:
- 📋 Tela de histórico para ver todos os PDFs
- 🔍 Busca por BO, data, usuário
- 📥 Download de PDFs antigos
- 📊 Dashboard de estatísticas
- 🗑️ Deletar PDFs antigos

Mas isso é **opcional**. O backup automático já está funcionando! 🎉

---

## 🆘 Precisa de Ajuda?

- Documentação Supabase: https://supabase.com/docs
- Documentação Storage: https://supabase.com/docs/guides/storage

---

**Configurado com ❤️ para o Photo Report App**
