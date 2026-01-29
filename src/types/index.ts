export interface Profile {
  id: string
  name: string
  email?: string
  avatar_url?: string
  role: 'admin' | 'user'
  is_active?: boolean
  created_at: string
}

export interface Debt {
  id: string
  user_id: string
  title: string
  description: string
  amount_cents: number
  status: 'pending' | 'paid'
  due_date?: string
  created_by: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface PaymentRequest {
  id: string
  debt_id: string
  user_id: string
  message: string
  receipt_url?: string
  receipt_name?: string
  status: 'open' | 'approved' | 'rejected'
  admin_note?: string
  created_at: string
  decided_at?: string
  debts?: Debt
  profiles?: Profile
}

export interface AuthUser {
  id: string
  email: string
  profile?: Profile
}
