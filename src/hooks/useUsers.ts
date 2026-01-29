import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Profile } from '@/types'

export const useUsers = () => {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setUsers(data || [])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      // Atualizar lista local
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      )

      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId)

      if (error) throw error

      // Atualizar lista local
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, is_active: !currentStatus } : user
        )
      )

      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUserRole,
    toggleUserStatus
  }
}
