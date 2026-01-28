-- Script para configurar usuário como administrador
-- Execute este SQL no painel do Supabase após criar sua conta

-- 1. Primeiro, cadastre-se na aplicação com seu email
-- 2. Depois, execute este SQL para transformar em admin

-- Atualizar usuário para admin (substitua 'seu-email@exemplo.com')
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'seu-email@exemplo.com';

-- Verificar se foi atualizado
SELECT id, name, email, role, created_at 
FROM profiles 
WHERE email = 'seu-email@exemplo.com';

-- Ou se preferir usar o ID do usuário:
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = 'UUID-DO-USUARIO';
