-- Adicionar colunas de comprovante à tabela payment_requests
-- Execute isso no Supabase SQL Editor

-- Adicionar colunas para URL e nome do comprovante
ALTER TABLE payment_requests 
ADD COLUMN receipt_url TEXT,
ADD COLUMN receipt_name TEXT;

-- Verificar se as colunas foram adicionadas
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'payment_requests' 
  AND column_name IN ('receipt_url', 'receipt_name')
ORDER BY column_name;
