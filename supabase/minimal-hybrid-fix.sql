-- MÍNIMO HÍBRIDO: profiles totalmente aberto, debts com RLS completo
-- Resolve: erro de perfil ao ativar RLS + dívidas que somem após reload

-- 1) Profiles: DESABILITAR RLS e REMOVER TRIGGERS (totalmente aberto)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS profile_protection_trigger ON profiles;
DROP FUNCTION IF EXISTS prevent_profile_hijack() CASCADE;

-- 2) Debts: RLS completo (SELECT/INSERT/UPDATE/DELETE)
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas
DROP POLICY IF EXISTS "Users can view own debts" ON debts;
DROP POLICY IF EXISTS "Admins can view all debts" ON debts;
DROP POLICY IF EXISTS "Users can insert own debts" ON debts;
DROP POLICY IF EXISTS "Admins can insert debts" ON debts;
DROP POLICY IF EXISTS "Users can update own debts" ON debts;
DROP POLICY IF EXISTS "Admins can update debts" ON debts;
DROP POLICY IF EXISTS "Users can delete own debts" ON debts;
DROP POLICY IF EXISTS "Admins can delete debts" ON debts;

-- SELECT
CREATE POLICY "Users can view own debts" ON debts
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all debts" ON debts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- INSERT
CREATE POLICY "Users can insert own debts" ON debts
FOR INSERT
WITH CHECK (
  created_by = auth.uid() AND user_id = auth.uid()
);

CREATE POLICY "Admins can insert debts" ON debts
FOR INSERT
WITH CHECK (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- UPDATE
CREATE POLICY "Users can update own debts" ON debts
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Admins can update debts" ON debts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- DELETE
CREATE POLICY "Users can delete own debts" ON debts
FOR DELETE
USING (user_id = auth.uid());

CREATE POLICY "Admins can delete debts" ON debts
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3) Payment_requests: RLS básico
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own requests" ON payment_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON payment_requests;
DROP POLICY IF EXISTS "Users can insert requests" ON payment_requests;

CREATE POLICY "Users can view own requests" ON payment_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM debts d
    WHERE d.id = payment_requests.debt_id
    AND d.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all requests" ON payment_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can insert requests" ON payment_requests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM debts d
    WHERE d.id = payment_requests.debt_id
    AND d.user_id = auth.uid()
  )
);

-- 4) Verificar final (opcional)
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('debts', 'payment_requests')
ORDER BY tablename, policyname;
