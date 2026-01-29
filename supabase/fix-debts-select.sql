-- FIX SELECT policies para debts (resolve "dívida some após reload, mas está no banco")
-- Problema: INSERT funciona mas SELECT não retorna após reload (RLS SELECT bloqueando)

-- 1) Remover policies antigas de SELECT (se existirem)
DROP POLICY IF EXISTS "Users can view own debts" ON debts;
DROP POLICY IF EXISTS "Admins can view all debts" ON debts;

-- 2) Criar policies de SELECT simples e diretas
-- Usuário pode ver as dívidas onde user_id = auth.uid()
CREATE POLICY "Users can view own debts" ON debts
FOR SELECT
USING (user_id = auth.uid());

-- Admin pode ver todas as dívidas (baseado em profiles.role = 'admin')
CREATE POLICY "Admins can view all debts" ON debts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3) Verificar se as policies foram criadas
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'debts' AND cmd = 'SELECT'
ORDER BY policyname;
