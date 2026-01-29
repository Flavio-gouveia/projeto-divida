-- TESTE: Query direta para profiles (mesma do fetchProfile)
-- Execute isso no Supabase SQL Editor para ver se funciona

SELECT *
FROM profiles
WHERE id = 'bfa66135-a779-4c06-9138-a4c019199c92'
LIMIT 1;

-- Se isso funcionar, o problema é no frontend
-- Se isso travar, o problema é no banco (RLS/triggers)
