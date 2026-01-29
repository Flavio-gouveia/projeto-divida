-- DEBUG: Query simplificada sem join com profiles
-- Execute no Supabase SQL Editor para testar se os dados básicos retornam

-- Teste 1: Ver todas as dívidas (como admin)
SELECT 
  id,
  user_id,
  created_by,
  title,
  description,
  amount_cents,
  status,
  due_date,
  created_at,
  updated_at
FROM debts
ORDER BY created_at DESC;

-- Teste 2: Ver dívidas de um usuário específico (substitua SEU_USER_ID)
-- Copie um user_id da tabela profiles e cole abaixo
SELECT 
  id,
  user_id,
  created_by,
  title,
  description,
  amount_cents,
  status,
  due_date,
  created_at,
  updated_at
FROM debts
WHERE user_id = 'SEU_USER_ID_AQUI'
ORDER BY created_at DESC;
