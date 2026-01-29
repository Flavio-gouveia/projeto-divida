-- FIX SELECT policies para debts (execute em blocos ou com Run, não Explain)

-- Bloco 1: Remover policies antigas
DROP POLICY IF EXISTS "Users can view own debts" ON debts;
DROP POLICY IF EXISTS "Admins can view all debts" ON debts;

-- Bloco 2: Criar policies de SELECT
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

-- Bloco 3: Verificar
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'debts' AND cmd = 'SELECT'
ORDER BY policyname;
