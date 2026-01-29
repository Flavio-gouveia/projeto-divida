-- REATIVAR RLS em debts com policies simples (já que frontend funciona)
-- Execute isso para voltar a segurança em debts

-- 1) Habilitar RLS
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

-- 3) Policies de SELECT
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

-- 4) Policies de INSERT
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

-- 5) Policies de UPDATE
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

-- 6) Policies de DELETE
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

-- 7) Verificar
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'debts'
ORDER BY policyname;
