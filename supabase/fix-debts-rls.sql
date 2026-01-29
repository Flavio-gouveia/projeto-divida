-- FIX RLS: debts (persistência após reload)
-- Problema comum: RLS está ativo em debts mas faltam policies de INSERT/UPDATE/DELETE e/ou policy de SELECT para admin.

-- 1) Garantir RLS habilitado
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- 2) Remover policies antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own debts" ON debts;
DROP POLICY IF EXISTS "Admins can view all debts" ON debts;
DROP POLICY IF EXISTS "Users can insert own debts" ON debts;
DROP POLICY IF EXISTS "Admins can insert debts" ON debts;
DROP POLICY IF EXISTS "Users can update own debts" ON debts;
DROP POLICY IF EXISTS "Admins can update debts" ON debts;
DROP POLICY IF EXISTS "Users can delete own debts" ON debts;
DROP POLICY IF EXISTS "Admins can delete debts" ON debts;

-- Helper: condição de admin (baseada na tabela profiles)
-- Observação: profiles está sem RLS no seu setup híbrido.

-- 3) SELECT
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

-- 4) INSERT
-- Usuário pode criar dívida para si mesmo
CREATE POLICY "Users can insert own debts" ON debts
FOR INSERT
WITH CHECK (
  created_by = auth.uid() AND user_id = auth.uid()
);

-- Admin pode criar dívida para qualquer user
CREATE POLICY "Admins can insert debts" ON debts
FOR INSERT
WITH CHECK (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5) UPDATE
-- Usuário pode atualizar dívidas dele (se precisar)
CREATE POLICY "Users can update own debts" ON debts
FOR UPDATE
USING (user_id = auth.uid());

-- Admin pode atualizar qualquer dívida
CREATE POLICY "Admins can update debts" ON debts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6) DELETE
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

-- 7) Verificar policies
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'debts'
ORDER BY policyname;
