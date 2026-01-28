import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Debt } from '@/types'

export const useDebts = (userId?: string) => {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDebts = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('debts')
        .select(`
          *,
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

      setDebts(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createDebt = async (debtData: Omit<Debt, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('debts')
        .insert(debtData)
        .select()
        .single()

      if (error) {
        throw error
      }

      setDebts(prev => [data, ...prev])
      return data
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const updateDebt = async (id: string, updates: Partial<Debt>) => {
    try {
      const { data, error } = await supabase
        .from('debts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setDebts(prev => prev.map(debt => 
        debt.id === id ? { ...debt, ...data } : debt
      ))
      return data
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  const deleteDebt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      setDebts(prev => prev.filter(debt => debt.id !== id))
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  useEffect(() => {
    fetchDebts()
  }, [userId])

  return {
    debts,
    loading,
    error,
    refetch: fetchDebts,
    createDebt,
    updateDebt,
    deleteDebt,
  }
}
