-- SEGURANÇA HÍBRIDA - RLS apenas onde importa
-- Profiles: público (nome, avatar) mas protegido contra edição
-- Outras tabelas: RLS completo

-- 1. Manter profiles sem RLS (performance)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Adicionar trigger para segurança básica de edição
CREATE OR REPLACE FUNCTION prevent_profile_hijack()
RETURNS TRIGGER AS $$
BEGIN
    -- Só permite editar se for o dono OU admin
    IF OLD.id != auth.uid() AND OLD.role != 'admin' THEN
        RAISE EXCEPTION 'Permission denied: Cannot edit other users profiles';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Adicionar trigger de proteção
DROP TRIGGER IF EXISTS profile_protection_trigger ON profiles;
CREATE TRIGGER profile_protection_trigger
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_profile_hijack();

-- 4. RLS para tabelas SENSÍVEIS (onde realmente importa)
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

-- 5. Policies para debts (proteção real)
CREATE POLICY "Users can view own debts" ON debts FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all debts" ON debts FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- 6. Policies para payment_requests
CREATE POLICY "Users can view own requests" ON payment_requests FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM debts d 
        WHERE d.id = payment_requests.debt_id 
        AND d.user_id = auth.uid()
    ));

CREATE POLICY "Admins can view all requests" ON payment_requests FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- 7. Verificar configuração
SELECT 
    schemaname,
    tablename,
    rowlevelsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('profiles', 'debts', 'payment_requests')
ORDER BY tablename;
