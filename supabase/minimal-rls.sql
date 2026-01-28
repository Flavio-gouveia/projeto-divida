-- RLS MINIMAL - APENAS O ESSENCIAL
-- Se isso não funcionar, mantenha RLS desabilitado

-- 1. Remover todas as policies existentes
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 2. Criar UMA policy simples para tudo
CREATE POLICY "Allow all operations for authenticated users" 
ON profiles FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');

-- 3. Verificar
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';
