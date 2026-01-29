-- DEBUG: Desabilitar RLS em debts para confirmar que é RLS bloqueando SELECT
-- Execute isso APENAS para teste. Se as dívidas aparecerem, o problema é RLS.

-- Desabilitar RLS em debts
ALTER TABLE debts DISABLE ROW LEVEL SECURITY;

-- Verificar
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'debts';
