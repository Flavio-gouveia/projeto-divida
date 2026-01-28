-- EMERGENCY FIX - Desabilitar RLS completamente para teste
-- Execute isso se nada mais funcionar

-- 1. Desabilitar RLS completamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se o profile existe
SELECT * FROM profiles WHERE id = 'bfa66135-a779-4c06-9138-a4c019199c92';

-- 3. Criar profile se não existir
INSERT INTO profiles (id, name, role) 
VALUES ('bfa66135-a779-4c06-9138-a4c019199c92', 'Usuário Teste', 'user')
ON CONFLICT (id) DO NOTHING;

-- 4. Verificar resultado
SELECT * FROM profiles WHERE id = 'bfa66135-a779-4c06-9138-a4c019199c92';

-- IMPORTANTE: Isso desabilita RLS temporariamente para teste
-- Depois que funcionar, podemos reabilitar com policies corretas
