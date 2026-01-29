-- GARANTIR QUE profiles ESTÁ SEM RLS (para resolver fetchProfile travando)
-- Execute isso no Supabase SQL Editor

-- 1) Desabilitar RLS em profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2) Remover qualquer trigger que possa estar bloqueando
DROP TRIGGER IF EXISTS profile_protection_trigger ON profiles;
DROP FUNCTION IF EXISTS prevent_profile_hijack() CASCADE;

-- 3) Verificar se RLS está desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';
