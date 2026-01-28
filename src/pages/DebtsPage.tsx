import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useDebts } from '@/hooks/useDebts'
import { useProfiles } from '@/hooks/useProfiles'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog'
import { Label } from '@/components/ui/Label'
import { formatCurrency } from '@/utils/formatCurrency'
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react'

const DebtsPage: React.FC = () => {
  const { profile, isAdmin } = useAuth()
  const { debts, createDebt, deleteDebt } = useDebts(isAdmin ? undefined : profile?.id)
  const { profiles } = useProfiles()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newDebt, setNewDebt] = useState({
    user_id: '',
    title: '',
    description: '',
    amount_cents: 0,
    due_date: ''
  })

  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || debt.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createDebt({
        ...newDebt,
        created_by: profile!.id,
        status: 'pending'
      })
      setIsCreateDialogOpen(false)
      setNewDebt({
        user_id: '',
        title: '',
        description: '',
        amount_cents: 0,
        due_date: ''
      })
    } catch (error) {
      console.error('Error creating debt:', error)
    }
  }

  const handleDeleteDebt = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta dívida?')) {
      try {
        await deleteDebt(id)
      } catch (error) {
        console.error('Error deleting debt:', error)
      }
    }
  }

  const parseAmount = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, '')
    return parseInt(cleanValue || '0', 10)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'Todas as Dívidas' : 'Minhas Dívidas'}
          </h1>
          <p className="text-gray-600">
            {isAdmin ? 'Gerencie todas as dívidas do sistema' : 'Visualize e gerencie suas dívidas'}
          </p>
        </div>
        
        {isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Dívida
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Dívida</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar uma nova dívida
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateDebt} className="space-y-4">
                <div>
                  <Label htmlFor="user">Usuário</Label>
                  <select
                    id="user"
                    value={newDebt.user_id}
                    onChange={(e) => setNewDebt({ ...newDebt, user_id: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione um usuário</option>
                    {profiles.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newDebt.title}
                    onChange={(e) => setNewDebt({ ...newDebt, title: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={newDebt.description}
                    onChange={(e) => setNewDebt({ ...newDebt, description: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    type="text"
                    value={formatCurrency(newDebt.amount_cents)}
                    onChange={(e) => setNewDebt({ ...newDebt, amount_cents: parseAmount(e.target.value) })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="dueDate">Data de Vencimento</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newDebt.due_date}
                    onChange={(e) => setNewDebt({ ...newDebt, due_date: e.target.value })}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Criar Dívida
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar dívidas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'paid')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Todos os status</option>
          <option value="pending">Pendentes</option>
          <option value="paid">Pagas</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredDebts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 text-center">
                {searchTerm || statusFilter !== 'all'
                  ? 'Nenhuma dívida encontrada com os filtros aplicados'
                  : 'Nenhuma dívida encontrada'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDebts.map((debt) => (
            <Card key={debt.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{debt.title}</h3>
                      <Badge variant={debt.status === 'paid' ? 'default' : 'secondary'}>
                        {debt.status === 'paid' ? 'Paga' : 'Pendente'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{debt.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {isAdmin && debt.profiles && (
                        <span>Usuário: {debt.profiles.name}</span>
                      )}
                      <span>Valor: {formatCurrency(debt.amount_cents)}</span>
                      {debt.due_date && (
                        <span>Vencimento: {new Date(debt.due_date).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/app/debts/${debt.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                    
                    {isAdmin && (
                      <>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteDebt(debt.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default DebtsPage
