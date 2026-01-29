-- Criar bucket para comprovantes de pagamento
-- Execute isso no Supabase SQL Editor

-- 1) Criar o bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-receipts', 'payment-receipts', false);

-- 2) Criar políticas de acesso
-- Usuários autenticados podem fazer upload
CREATE POLICY "Users can upload payment receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-receipts' 
  AND auth.role() = 'authenticated'
);

-- Usuários autenticados podem ler seus próprios arquivos
CREATE POLICY "Users can read own payment receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-receipts' 
  AND auth.role() = 'authenticated'
);

-- Admins podem ler todos os comprovantes
CREATE POLICY "Admins can read all payment receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-receipts' 
  AND (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
);

-- Usuários podem atualizar seus próprios arquivos
CREATE POLICY "Users can update own payment receipts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'payment-receipts' 
  AND auth.role() = 'authenticated'
);

-- Usuários podem deletar seus próprios arquivos
CREATE POLICY "Users can delete own payment receipts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'payment-receipts' 
  AND auth.role() = 'authenticated'
);
