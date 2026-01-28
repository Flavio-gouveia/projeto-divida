-- Políticas de Storage para o bucket "avatars"
-- Execute este SQL no painel do Supabase após criar o bucket

-- 1. Criar bucket "avatars" (se ainda não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de acesso para o bucket "avatars"

-- Usuários podem fazer upload apenas na sua própria pasta
CREATE POLICY "Users can upload own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = SPLIT_PART(name, '/', 1)
    );

-- Usuários podem visualizar avatares públicos
CREATE POLICY "Anyone can view avatars"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'avatars'
    );

-- Usuários podem atualizar apenas seus próprios avatares
CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = SPLIT_PART(name, '/', 1)
    );

-- Usuários podem deletar apenas seus próprios avatares
CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = SPLIT_PART(name, '/', 1)
    );

-- 3. Adicionar coluna updated_at na tabela profiles (se não existir)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Verificar se as políticas foram criadas
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
WHERE tablename = 'objects' AND schemaname = 'storage';
