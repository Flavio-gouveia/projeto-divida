import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { PaymentRequest } from '@/types'

export const usePaymentRequests = (userId?: string) => {
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('payment_requests')
        .select(`
          *,
          debts (
            id,
            title,
            amount_cents,
            status
          ),
          profiles (
            id,
            name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setRequests(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createRequest = async (requestData: Omit<PaymentRequest, 'id' | 'created_at' | 'decided_at'>) => {
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .insert(requestData)
        .select()
        .single()

      if (error) {
        throw error
      }

      setRequests(prev => [data, ...prev])
      return data
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const updateRequest = async (id: string, updates: Partial<PaymentRequest>) => {
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setRequests(prev => prev.map(request => 
        request.id === id ? { ...request, ...data } : request
      ))
      return data
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const approveRequest = async (id: string, adminNote?: string) => {
    return updateRequest(id, { 
      status: 'approved', 
      admin_note: adminNote 
    })
  }

  const rejectRequest = async (id: string, adminNote?: string) => {
    return updateRequest(id, { 
      status: 'rejected', 
      admin_note: adminNote 
    })
  }

  useEffect(() => {
    fetchRequests()
  }, [userId])

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
    createRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
  }
}
