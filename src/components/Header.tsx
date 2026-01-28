import React from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { 
  LogOut, 
  Settings, 
  ChevronDown,
  Menu,
  AlertCircle
} from 'lucide-react'

interface HeaderProps {
  onMenuClick?: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { profile, signOut, isAdmin, loading, error } = useAuth()
  const location = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)

  // Obter título da página baseado na rota
  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/dashboard')) return 'Dashboard'
    if (path.includes('/debts')) return 'Dívidas'
    if (path.includes('/requests')) return 'Solicitações'
    if (path.includes('/profile')) return 'Perfil'
    return 'Gestão de Dívidas'
  }

  const handleSignOut = async () => {
    await signOut()
    setIsDropdownOpen(false)
  }

  // Se ainda está carregando, mostrar skeleton curto
  if (loading) {
    return (
      <header className="h-16 border-b bg-background flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </header>
    )
  }

  // Fallback quando profile não existe ou há erro
  const displayName = profile?.name || 'Conta'

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Título da página */}
      <div className="flex items-center gap-4">
        <button 
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          {getPageTitle()}
        </h1>
        
        {isAdmin && (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            Admin
          </span>
        )}
        
        {error && (
          <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            <AlertCircle className="w-3 h-3" />
            Erro
          </div>
        )}
      </div>

      {/* Informações do usuário */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <Avatar
          src={profile?.avatar_url}
          name={profile?.name}
          size="md"
        />

        {/* Nome do usuário */}
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-900">
            {displayName}
          </p>
          {error && (
            <p className="text-xs text-red-500">
              Perfil não carregado
            </p>
          )}
        </div>

        {/* Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-1"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>

          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsDropdownOpen(false)}
              />
              
              {/* Dropdown menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isAdmin ? 'Administrador' : 'Usuário'}
                  </p>
                  {error && (
                    <p className="text-xs text-red-500">
                      Erro no perfil
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    setIsDropdownOpen(false)
                    // Navegar para perfil se necessário
                  }}
                  className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Perfil
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
