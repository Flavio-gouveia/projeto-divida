-- LIMPEZA COMPLETA PARA PRODUÇÃO
-- Execute isso ANTES do deploy

-- 1. Remover todos os profiles (exceto admin se existir)
DELETE FROM profiles WHERE role = 'user';

-- 2. Remover todos os debts
DELETE FROM debts;

-- 3. Remover todos os payment_requests
DELETE FROM payment_requests;

-- 4. Remover todos os avatares do storage
-- (Execute manualmente no Supabase Storage)

-- 5. Opcional: Resetar sequências (se usar)
-- ALTER SEQUENCE IF EXISTS debts_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS payment_requests_id_seq RESTART WITH 1;

-- 6. Verificar se está limpo
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'debts', COUNT(*) FROM debts
UNION ALL
SELECT 'payment_requests', COUNT(*) FROM payment_requests;

-- 7. Opcional: Remover todos os usuários de autenticação
-- CUIDADO: Isso vai remover TODOS os usuários
-- DELETE FROM auth.users WHERE email NOT LIKE '%admin%';
