# 🔐 Configuração de Autenticação no Netlify

Este guia ensina como configurar a autenticação de usuários para o app usando **Netlify Identity**.

## ⚙️ Passo 1: Habilitar Netlify Identity

1. Acesse o painel do Netlify: https://app.netlify.com
2. Selecione seu site (photo-report)
3. Vá em **Site settings** (Configurações do site)
4. No menu lateral, clique em **Identity**
5. Clique em **Enable Identity**

✅ Pronto! O Netlify Identity está ativo.

---

## 👥 Passo 2: Configurar Registro de Usuários

Por padrão, qualquer pessoa pode criar uma conta. Para restringir apenas a usuários convidados:

1. Em **Identity** → **Settings and usage**
2. Role até **Registration preferences**
3. Clique em **Edit settings**
4. Selecione: **Invite only** (Apenas por convite)
5. Clique em **Save**

✅ Agora apenas você pode convidar usuários!

---

## ✉️ Passo 3: Adicionar Usuários

### Opção A: Convidar por Email (Recomendado)

1. Vá em **Identity** no menu do site
2. Clique em **Invite users**
3. Digite o email da pessoa
4. Clique em **Send**

A pessoa receberá um email com link para criar a senha.

### Opção B: Criar Usuário Manualmente (Mais Rápido)

1. Vá em **Identity**
2. Clique em **Invite users**
3. Use a opção de criar senha diretamente
4. Compartilhe o email e senha com o usuário

---

## 📧 Passo 4: Configurar Email (Opcional mas Recomendado)

Por padrão, o Netlify envia emails de confirmação. Você pode personalizar:

1. Em **Identity** → **Settings**
2. Role até **Emails**
3. Clique em **Edit settings**
4. Personalize os templates de email (opcional)

---

## 🎯 Passo 5: Testar a Autenticação

1. Acesse seu site publicado
2. Você verá a tela de login
3. Clique em **"Criar Conta"** ou **"Entrar"**
4. Use as credenciais que você criou

### Para criar seu primeiro usuário:

- Clique em **"Criar Conta"** no app
- Preencha email e senha
- Se estiver em modo "Invite only", você precisa primeiro convidar pelo painel do Netlify

---

## 👤 Como Adicionar os 20-30 Usuários

### Método Rápido (Recomendado):

1. Vá no painel do Netlify → Identity
2. Clique em **Invite users**
3. Cole todos os emails separados por vírgula:
   ```
   usuario1@email.com, usuario2@email.com, usuario3@email.com
   ```
4. Clique em **Send**

Cada pessoa receberá um email para criar sua senha.

### Método Manual:

Repita para cada usuário:
1. Invite users → Digite o email
2. Pessoa recebe email → Cria senha
3. Pode fazer login no app

---

## 🔧 Configurações Avançadas (Opcional)

### Tempo de Sessão

Por padrão, usuários ficam logados por 1 semana. Para alterar:

1. Identity → Settings
2. JWT expiration: ajuste o tempo (em segundos)

### Confirmação de Email

Para desabilitar confirmação de email (mais rápido para testes internos):

1. Identity → Settings → Registration
2. Desmarque **"Enable email confirmation"**

---

## 🚨 Solução de Problemas

### "Erro ao fazer login"
- Verifique se Netlify Identity está habilitado
- Confirme que o site foi publicado (deploy feito)

### "Botão de criar conta não funciona"
- Verifique se está em modo "Invite only"
- Se sim, precisa convidar o usuário primeiro pelo painel

### "Email de convite não chegou"
- Verifique a caixa de spam
- Use a opção de criar usuário manualmente com senha

---

## 📊 Limites do Plano Grátis

- ✅ **1.000 usuários ativos/mês** (mais que suficiente para 20-30 pessoas)
- ✅ **5.000 convites por email/mês**
- ✅ Autenticação ilimitada

Para 20-30 usuários, o plano grátis é **mais que suficiente**! 🎉

---

## 🎓 Resumo Rápido

1. ✅ Habilitar Identity no Netlify
2. ✅ Configurar para "Invite only"
3. ✅ Convidar os 20-30 usuários por email
4. ✅ Eles recebem email e criam senha
5. ✅ Pronto! Podem fazer login no app

---

## 🆘 Precisa de Ajuda?

- Documentação oficial: https://docs.netlify.com/visitor-access/identity/
- Ou entre em contato com o desenvolvedor

---

**Desenvolvido com ❤️ para o projeto Photo Report**
