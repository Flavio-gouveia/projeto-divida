import { useState, type FC } from 'react'
import { useUsers } from '@/hooks/useUsers'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Search, Shield, ShieldOff, ToggleLeft, ToggleRight, Users, UserCheck, UserX } from 'lucide-react'

const UsersPage: FC = () => {
  const { users, loading, error, updateUserRole, toggleUserStatus } = useUsers()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active !== false) ||
                         (statusFilter === 'inactive' && user.is_active === false)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleRoleChange = async (newRole: 'user' | 'admin') => {
    if (!selectedUser) return

    const { error } = await updateUserRole(selectedUser.id, newRole)
    
    if (!error) {
      setIsRoleDialogOpen(false)
      setSelectedUser(null)
    }
  }

  const handleStatusToggle = async (user: any) => {
    const { error } = await toggleUserStatus(user.id, user.is_active !== false)
    
    if (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active !== false).length,
    inactive: users.filter(u => u.is_active === false).length,
    admins: users.filter(u => u.role === 'admin').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar usuários: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
        <p className="text-gray-600">Visualize e gerencie todos os usuários do sistema</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuários Inativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'all' | 'user' | 'admin')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Todos os papéis</option>
          <option value="user">Usuários</option>
          <option value="admin">Administradores</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>

      {/* Lista de Usuários */}
      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 text-center">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Nenhum usuário encontrado com os filtros aplicados'
                  : 'Nenhum usuário encontrado'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{user.name}</h3>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </Badge>
                      {user.is_active === false && (
                        <Badge variant="destructive">Inativo</Badge>
                      )}
                    </div>
                    
                    {user.email && (
                      <p className="text-gray-600 mb-2">{user.email}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>ID: {user.id.slice(0, 8)}...</span>
                      {user.created_at && (
                        <span>Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user)
                        setIsRoleDialogOpen(true)
                      }}
                      className="text-purple-600 hover:text-purple-700"
                    >
                      {user.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusToggle(user)}
                      className={user.is_active === false ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"}
                    >
                      {user.is_active === false ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog para mudar role */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Papel do Usuário</DialogTitle>
            <DialogDescription>
              Altere o papel de {selectedUser?.name} entre usuário e administrador.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedUser && (
              <div className="bg-gray-50 rounded p-3">
                <p className="font-medium">{selectedUser.name}</p>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Papel atual: {selectedUser.role === 'admin' ? 'Administrador' : 'Usuário'}
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => selectedUser && handleRoleChange(selectedUser.role === 'admin' ? 'user' : 'admin')}
                className={selectedUser?.role === 'admin' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}
              >
                Tornar {selectedUser?.role === 'admin' ? 'Usuário' : 'Administrador'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UsersPage
