-- CORREÇÃO FINAL DAS POLICIES (sem recursão e sem auth.users)
-- Execute este SQL para corrigir todos os problemas

-- 1. Remover todas as policies existentes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;

-- 2. Criar policies simples e funcionais

-- Usuários podem ver e editar próprio profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Admins podem ver todos os profiles (baseado no role na própria tabela)
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE role = 'admin'
        )
    );

-- Admins podem inserir profiles
CREATE POLICY "Admins can insert profiles"
    ON profiles FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE role = 'admin'
        )
    );

-- 3. Verificar se as policies foram criadas
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
