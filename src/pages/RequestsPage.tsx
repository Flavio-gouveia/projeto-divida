import { useState, type FC } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePaymentRequests } from '@/hooks/usePaymentRequests'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { formatCurrency } from '@/utils/formatCurrency'
import { CheckCircle, XCircle, Search, Calendar } from 'lucide-react'

const RequestsPage: FC = () => {
  const { profile, isAdmin } = useAuth()
  const { requests, approveRequest, rejectRequest } = usePaymentRequests(isAdmin ? undefined : profile?.id)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'approved' | 'rejected'>('all')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [adminNote, setAdminNote] = useState('')
  const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState(false)
  const [decisionType, setDecisionType] = useState<'approve' | 'reject'>('approve')

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.debts?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (isAdmin && request.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDecision = async () => {
    if (!selectedRequest) return

    try {
      if (decisionType === 'approve') {
        await approveRequest(selectedRequest.id, adminNote)
      } else {
        await rejectRequest(selectedRequest.id, adminNote)
      }
      
      setIsDecisionDialogOpen(false)
      setSelectedRequest(null)
      setAdminNote('')
    } catch (error) {
      console.error('Error processing request:', error)
    }
  }

  const openDecisionDialog = (request: any, type: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setDecisionType(type)
    setAdminNote('')
    setIsDecisionDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isAdmin ? 'Gerenciar Solicitações' : 'Minhas Solicitações'}
        </h1>
        <p className="text-gray-600">
          {isAdmin 
            ? 'Aprovar ou rejeitar solicitações de confirmação de pagamento'
            : 'Visualize o status das suas solicitações de pagamento'
          }
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar solicitações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'approved' | 'rejected')}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Todos os status</option>
          <option value="open">Abertas</option>
          <option value="approved">Aprovadas</option>
          <option value="rejected">Rejeitadas</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 text-center">
                {searchTerm || statusFilter !== 'all'
                  ? 'Nenhuma solicitação encontrada com os filtros aplicados'
                  : 'Nenhuma solicitação encontrada'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{request.debts?.title}</h3>
                      <Badge variant={
                        request.status === 'approved' ? 'default' :
                        request.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {request.status === 'approved' ? 'Aprovada' :
                         request.status === 'rejected' ? 'Rejeitada' : 'Aberta'}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{request.message}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      {isAdmin && request.profiles && (
                        <span>Usuário: {request.profiles.name}</span>
                      )}
                      <span>Valor: {formatCurrency(request.debts?.amount_cents || 0)}</span>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(request.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    {request.admin_note && (
                      <div className="bg-gray-50 rounded p-3 mb-3">
                        <p className="text-sm font-medium text-gray-700">Nota do administrador:</p>
                        <p className="text-sm text-gray-600">{request.admin_note}</p>
                      </div>
                    )}
                    
                    {request.decided_at && (
                      <p className="text-xs text-gray-500">
                        Decidido em: {new Date(request.decided_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  
                  {isAdmin && request.status === 'open' && (
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDecisionDialog(request, 'approve')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDecisionDialog(request, 'reject')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {isAdmin && (
        <Dialog open={isDecisionDialogOpen} onOpenChange={setIsDecisionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {decisionType === 'approve' ? 'Aprovar Solicitação' : 'Rejeitar Solicitação'}
              </DialogTitle>
              <DialogDescription>
                {decisionType === 'approve' 
                  ? 'Confirme a aprovação desta solicitação de pagamento'
                  : 'Informe o motivo da rejeição desta solicitação'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedRequest && (
                <div className="bg-gray-50 rounded p-3">
                  <p className="font-medium">{selectedRequest.debts?.title}</p>
                  <p className="text-sm text-gray-600">{selectedRequest.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Usuário: {selectedRequest.profiles?.name}
                  </p>
                </div>
              )}
              
              <div>
                <Label htmlFor="adminNote">
                  {decisionType === 'approve' ? 'Nota (opcional)' : 'Motivo da rejeição'}
                </Label>
                <textarea
                  id="adminNote"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full p-2 border rounded-md min-h-[80px] resize-none"
                  placeholder={decisionType === 'approve' 
                    ? 'Adicione uma nota para o usuário (opcional)...'
                    : 'Explique o motivo da rejeição...'
                  }
                  required={decisionType === 'reject'}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDecisionDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleDecision}
                  className={decisionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                >
                  {decisionType === 'approve' ? 'Aprovar' : 'Rejeitar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default RequestsPage
