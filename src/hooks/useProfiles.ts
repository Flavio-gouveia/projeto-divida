import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Profile } from '@/types'

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'user')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setProfiles(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (id: string, updates: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setProfiles(prev => prev.map(profile => 
        profile.id === id ? { ...profile, ...data } : profile
      ))
      return data
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  return {
    profiles,
    loading,
    error,
    refetch: fetchProfiles,
    updateProfile,
  }
}
