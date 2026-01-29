import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { PaymentRequest } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

export const usePaymentRequests = (userId?: string) => {
  const { user } = useAuth()
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

  const uploadReceipt = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('payment-receipts')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('payment-receipts')
        .getPublicUrl(filePath)

      return {
        url: publicUrl,
        name: file.name
      }
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const createRequest = async (requestData: Omit<PaymentRequest, 'id' | 'created_at' | 'decided_at'>, receiptFile?: File) => {
    try {
      let receiptData = {}

      if (receiptFile) {
        const receipt = await uploadReceipt(receiptFile)
        receiptData = {
          receipt_url: receipt.url,
          receipt_name: receipt.name
        }
      }

      const { data, error } = await supabase
        .from('payment_requests')
        .insert({
          ...requestData,
          user_id: user?.id || userId, // Usa o user do auth ou o userId passado
          ...receiptData
        })
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
    uploadReceipt,
    updateRequest,
    approveRequest,
    rejectRequest,
  }
}
