-- SOLUÇÃO SIMPLES E DEFINITIVA
-- Desabilitar RLS temporariamente e recriar policies básicas

-- 1. Desabilitar RLS completamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar apenas policies essenciais (sem recursão)
CREATE POLICY "Enable read access for all users" ON profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON profiles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on id" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 4. Verificar se o profile do usuário existe
SELECT * FROM profiles WHERE id = 'bfa66135-a779-4c06-9138-a4c019199c92';

-- 5. Se não existir, criar manualmente
INSERT INTO profiles (id, name, role) 
VALUES ('bfa66135-a779-4c06-9138-a4c019199c92', 'Usuário Teste', 'user')
ON CONFLICT (id) DO NOTHING;

-- 6. Verificar policies criadas
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
