import { useState, useEffect, type FC } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useDebts } from '@/hooks/useDebts'
import { usePaymentRequests } from '@/hooks/usePaymentRequests'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/utils/formatCurrency'
import { ArrowLeft, CheckCircle, XCircle, MessageSquare, Calendar, DollarSign } from 'lucide-react'
import RequestPaymentDialog from '@/components/RequestPaymentDialog'

const DebtDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const { debts, updateDebt } = useDebts()
  const { requests } = usePaymentRequests()
  
  const [debt, setDebt] = useState(debts.find(d => d.id === id))
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)

  useEffect(() => {
    const foundDebt = debts.find(d => d.id === id)
    setDebt(foundDebt)
  }, [debts, id])

  const handleStatusChange = async (newStatus: 'pending' | 'paid') => {
    if (!debt) return
    
    try {
      await updateDebt(debt.id, { status: newStatus })
    } catch (error) {
      console.error('Error updating debt status:', error)
    }
  }

  const handleCreateRequest = async () => {
    if (!debt) return
    setIsRequestDialogOpen(true)
  }

  const debtRequests = requests.filter(r => r.debt_id === id)

  if (!debt) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dívida não encontrada</h2>
        <Button onClick={() => navigate('/app/debts')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Dívidas
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate('/app/debts')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{debt.title}</h1>
          <p className="text-gray-600">Detalhes da dívida</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Dívida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">
                    <Badge variant={debt.status === 'paid' ? 'default' : 'secondary'}>
                      {debt.status === 'paid' ? 'Paga' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Valor</Label>
                  <div className="mt-1 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                    <span className="text-lg font-semibold">{formatCurrency(debt.amount_cents)}</span>
                  </div>
                </div>
                
                {debt.due_date && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Data de Vencimento</Label>
                    <div className="mt-1 flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      <span>{new Date(debt.due_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Data de Criação</Label>
                  <div className="mt-1">
                    <span>{new Date(debt.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
              
              {debt.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Descrição</Label>
                  <p className="mt-1 text-gray-900">{debt.description}</p>
                </div>
              )}
              
              {isAdmin && debt.profiles && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Usuário</Label>
                  <p className="mt-1 text-gray-900">{debt.profiles.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Solicitações</CardTitle>
              <CardDescription>
                Solicitações de confirmação de pagamento para esta dívida
              </CardDescription>
            </CardHeader>
            <CardContent>
              {debtRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma solicitação de pagamento encontrada
                </p>
              ) : (
                <div className="space-y-4">
                  {debtRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
                            {request.profiles?.name || 'Usuário'}
                          </span>
                          <Badge variant={
                            request.status === 'approved' ? 'default' :
                            request.status === 'rejected' ? 'destructive' : 'secondary'
                          }>
                            {request.status === 'approved' ? 'Aprovada' :
                             request.status === 'rejected' ? 'Rejeitada' : 'Aberta'}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(request.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-2">{request.message}</p>
                      
                      {request.admin_note && (
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-sm font-medium text-gray-700">Nota do administrador:</p>
                          <p className="text-sm text-gray-600">{request.admin_note}</p>
                        </div>
                      )}
                      
                      {request.decided_at && (
                        <p className="text-xs text-gray-500 mt-2">
                          Decidido em: {new Date(request.decided_at).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isAdmin && debt.status === 'pending' && (
                <Button className="w-full" onClick={handleCreateRequest}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Solicitar Confirmação de Pagamento
                </Button>
              )}
              
              {isAdmin && (
                <div className="space-y-2">
                  <Button
                    variant={debt.status === 'paid' ? 'outline' : 'default'}
                    onClick={() => handleStatusChange('paid')}
                    className="w-full"
                    disabled={debt.status === 'paid'}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como Paga
                  </Button>
                  
                  <Button
                    variant={debt.status === 'pending' ? 'outline' : 'default'}
                    onClick={() => handleStatusChange('pending')}
                    className="w-full"
                    disabled={debt.status === 'pending'}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Marcar como Pendente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {debt && (
        <RequestPaymentDialog
          isOpen={isRequestDialogOpen}
          onClose={() => setIsRequestDialogOpen(false)}
          debtId={debt.id}
          debtTitle={debt.title}
          debtAmount={debt.amount_cents}
        />
      )}
    </div>
  )
}

export default DebtDetailPage
