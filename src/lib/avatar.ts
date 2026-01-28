import { supabase } from './supabaseClient'

export interface AvatarUploadResult {
  url: string
  path: string
}

/**
 * Valida arquivo de avatar
 */
export const validateAvatarFile = (file: File): { valid: boolean; error?: string } => {
  // Validar tipo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato de arquivo inválido. Use JPG, PNG ou WebP.'
    }
  }

  // Validar tamanho (2MB)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Arquivo muito grande. Use até 2MB.'
    }
  }

  return { valid: true }
}

/**
 * Faz upload de avatar para o Supabase Storage
 */
export const uploadAvatar = async (
  file: File, 
  userId: string
): Promise<AvatarUploadResult> => {
  // Validar arquivo
  const validation = validateAvatarFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Gerar nome único
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  try {
    // Upload do arquivo
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      throw new Error(`Erro no upload: ${uploadError.message}`)
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return {
      url: publicUrl,
      path: filePath
    }
  } catch (error) {
    console.error('Error uploading avatar:', error)
    throw error
  }
}

/**
 * Remove avatar do storage
 */
export const removeAvatar = async (avatarUrl: string): Promise<void> => {
  try {
    // Extrair path da URL
    const urlParts = avatarUrl.split('/')
    const path = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`

    const { error } = await supabase.storage
      .from('avatars')
      .remove([path])

    if (error) {
      console.error('Error removing avatar:', error)
      throw new Error(`Erro ao remover avatar: ${error.message}`)
    }
  } catch (error) {
    console.error('Error removing avatar:', error)
    throw error
  }
}

/**
 * Atualiza profile com nome e avatar
 */
export const updateProfile = async (
  userId: string,
  data: {
    name?: string
    avatar_url?: string | null
  }
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)

    if (error) {
      throw new Error(`Erro ao atualizar perfil: ${error.message}`)
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    throw error
  }
}

/**
 * Gera URL com cache-buster para avatar
 */
export const getAvatarUrl = (avatarUrl: string, updatedAt?: string): string => {
  if (!avatarUrl) return ''
  
  const cacheBuster = updatedAt ? `?v=${updatedAt}` : `?v=${Date.now()}`
  return `${avatarUrl}${cacheBuster}`
}
