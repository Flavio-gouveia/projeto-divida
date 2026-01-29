import type { FC } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useDebts } from '@/hooks/useDebts'
import { usePaymentRequests } from '@/hooks/usePaymentRequests'
import { useProfiles } from '@/hooks/useProfiles'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/utils/formatCurrency'
import { Users, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react'

const DashboardPage: FC = () => {
  const { user, profile, isAdmin } = useAuth()
  const { debts } = useDebts(isAdmin ? undefined : user?.id)
  const { requests } = usePaymentRequests()
  const { profiles } = useProfiles()

  const userDebts = isAdmin ? debts : debts.filter(debt => debt.user_id === user?.id)
  const pendingDebts = userDebts.filter(debt => debt.status === 'pending')
  const paidDebts = userDebts.filter(debt => debt.status === 'paid')
  const openRequests = requests.filter(request => request.status === 'open')

  const totalPending = pendingDebts.reduce((sum, debt) => sum + debt.amount_cents, 0)
  const totalPaid = paidDebts.reduce((sum, debt) => sum + debt.amount_cents, 0)

  if (isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600">Visão geral do sistema de gestão de dívidas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profiles.length}</div>
              <p className="text-xs text-muted-foreground">
                Usuários ativos no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total em Dívidas Pendentes</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
              <p className="text-xs text-muted-foreground">
                {pendingDebts.length} dívidas pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
              <p className="text-xs text-muted-foreground">
                {paidDebts.length} dívidas pagas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solicitações Abertas</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openRequests.length}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando aprovação
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dívidas Recentes</CardTitle>
              <CardDescription>Últimas dívidas cadastradas no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {debts.slice(0, 5).map((debt) => (
                  <div key={debt.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{debt.title}</p>
                      <p className="text-sm text-gray-500">{debt.profiles?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(debt.amount_cents)}</p>
                      <Badge variant={debt.status === 'paid' ? 'default' : 'secondary'}>
                        {debt.status === 'paid' ? 'Paga' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Pagamento</CardTitle>
              <CardDescription>Últimas solicitações recebidas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {openRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{request.debts?.title}</p>
                      <p className="text-sm text-gray-500">{request.profiles?.name}</p>
                    </div>
                    <Badge variant="outline">
                      {request.status === 'open' ? 'Aberta' : request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo, {profile?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground">
              {pendingDebts.length} dívidas pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {paidDebts.length} dívidas pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minhas Solicitações</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.filter(r => r.user_id === user?.id).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Solicitações enviadas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Minhas Dívidas</CardTitle>
          <CardDescription>Visão geral das suas dívidas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userDebts.slice(0, 5).map((debt) => (
              <div key={debt.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{debt.title}</p>
                  <p className="text-sm text-gray-500">
                    {debt.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(debt.amount_cents)}</p>
                  <Badge variant={debt.status === 'paid' ? 'default' : 'secondary'}>
                    {debt.status === 'paid' ? 'Paga' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardPage
