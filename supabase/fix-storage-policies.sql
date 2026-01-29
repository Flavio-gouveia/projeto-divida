-- Corrigir políticas de acesso ao storage bucket payment-receipts
-- Execute isso no Supabase SQL Editor

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Users can upload payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own payment receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own payment receipts" ON storage.objects;

-- Criar políticas simplificadas
-- Qualquer usuário autenticado pode fazer upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-receipts' 
  AND auth.role() = 'authenticated'
);

-- Qualquer usuário autenticado pode ler (baixar) qualquer arquivo
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-receipts' 
  AND auth.role() = 'authenticated'
);

-- Qualquer usuário autenticado pode atualizar
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'payment-receipts' 
  AND auth.role() = 'authenticated'
);

-- Qualquer usuário autenticado pode deletar
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'payment-receipts' 
  AND auth.role() = 'authenticated'
);

-- Verificar se as políticas foram criadas
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
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;
