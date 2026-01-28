import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import { uploadAvatar, removeAvatar, updateProfile, getAvatarUrl } from '@/lib/avatar'
import { Camera, Upload, AlertTriangle, RefreshCw, X } from 'lucide-react'

const ProfilePage: React.FC = () => {
  const { profile, user, refreshProfile, loading: authLoading, error: authError } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sincronizar estado local com profile do contexto
  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setAvatarUrl(profile.avatar_url || '')
      setPreviewUrl(null)
      setSelectedFile(null)
      setError(null)
      setSuccess(null)
    }
  }, [profile])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar arquivo
    const validation = validateAvatarFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Erro na validação do arquivo')
      return
    }

    setSelectedFile(file)
    setError(null)
    
    // Criar preview local
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePreview = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      let finalAvatarUrl = avatarUrl

      // Se há arquivo selecionado, fazer upload primeiro
      if (selectedFile) {
        const uploadResult = await uploadAvatar(selectedFile, profile.id)
        finalAvatarUrl = uploadResult.url
      }

      // Atualizar profile
      await updateProfile(profile.id, {
        name,
        avatar_url: finalAvatarUrl || null
      })

      // Atualizar estado local
      setAvatarUrl(finalAvatarUrl || '')
      setPreviewUrl(null)
      setSelectedFile(null)

      // Refresh do contexto para atualizar header
      await refreshProfile()

      setSuccess('Perfil atualizado com sucesso!')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setError(error.message || 'Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!profile || !avatarUrl) return

    setUploadingAvatar(true)
    setError(null)
    
    try {
      await removeAvatar(avatarUrl)
      
      // Atualizar profile removendo avatar
      await updateProfile(profile.id, { avatar_url: null })
      
      setAvatarUrl('')
      setPreviewUrl(null)
      setSelectedFile(null)
      
      // Refresh do contexto
      await refreshProfile()
      
      setSuccess('Avatar removido com sucesso!')
    } catch (error: any) {
      console.error('Error removing avatar:', error)
      setError(error.message || 'Erro ao remover avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleRetry = async () => {
    setError(null)
    await refreshProfile()
  }

  // Função de validação local (importada do avatar.ts)
  const validateAvatarFile = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Formato inválido. Use JPG, PNG ou WebP.' }
    }
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return { valid: false, error: 'Arquivo muito grande. Máximo 2MB.' }
    }
    return { valid: true }
  }

  // Estado 1: Carregando inicial
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  // Estado 2: Erro no auth ou profile não encontrado
  if (authError || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erro ao carregar perfil
            </h3>
            <p className="text-gray-600 mb-4">
              {authError || 'Perfil não encontrado. Tente novamente.'}
            </p>
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Estado 3: Sucesso - mostrar formulário
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais</p>
      </div>

      {/* Mensagens de sucesso/erro */}
      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-sm text-green-800">{success}</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

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
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
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

                <Button type="submit" disabled={loading || uploadingAvatar}>
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
                {/* Avatar grande */}
                <div className="relative mb-4">
                  <Avatar
                    src={previewUrl || getAvatarUrl(avatarUrl)}
                    name={name}
                    size="xl"
                    className="border-4 border-gray-100"
                  />
                  
                  {/* Botão de upload */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary text-white p-3 rounded-full hover:bg-primary/80 transition-colors shadow-lg"
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Preview com opção de remover */}
                {previewUrl && (
                  <div className="w-full mb-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-800">Nova foto selecionada</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePreview}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
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

                  {avatarUrl && !previewUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar}
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      Remover Foto
                    </Button>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-500 text-center space-y-1">
                <p>Formatos: JPG, PNG, WebP</p>
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
