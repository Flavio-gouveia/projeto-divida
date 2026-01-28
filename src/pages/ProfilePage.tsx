import React, { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { supabase } from '@/lib/supabaseClient'
import { User, Camera, Upload } from 'lucide-react'

const ProfilePage: React.FC = () => {
  const { profile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', profile.id)

      if (error) {
        throw error
      }

      await refreshProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}.${fileExt}`
      const filePath = `${profile.id}/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (updateError) {
        throw updateError
      }

      setAvatarUrl(publicUrl)
      await refreshProfile()
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!profile || !avatarUrl) return

    try {
      // Extract file path from URL
      const urlParts = avatarUrl.split('/')
      const filePath = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`

      // Remove file from storage
      const { error: removeError } = await supabase.storage
        .from('avatars')
        .remove([filePath])

      if (removeError) {
        console.error('Error removing avatar:', removeError)
      }

      // Update profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile.id)

      if (updateError) {
        throw updateError
      }

      setAvatarUrl('')
      await refreshProfile()
    } catch (error) {
      console.error('Error removing avatar:', error)
    }
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações de perfil
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    O email não pode ser alterado
                  </p>
                </div>

                <div>
                  <Label htmlFor="role">Tipo de conta</Label>
                  <Input
                    id="role"
                    value={profile.role === 'admin' ? 'Administrador' : 'Usuário'}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>
                Altere sua foto de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="relative">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary/80 transition-colors"
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />

                <div className="flex flex-col space-y-2 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingAvatar ? 'Enviando...' : 'Enviar Foto'}
                  </Button>

                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveAvatar}
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      Remover Foto
                    </Button>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-500 text-center">
                <p>Formatos aceitos: JPG, PNG, GIF</p>
                <p>Tamanho máximo: 2MB</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
