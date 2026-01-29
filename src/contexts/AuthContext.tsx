import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { Profile } from '@/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  error: string | null
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = profile?.role === 'admin'

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        throw error
      }

      if (data) {
        setProfile(data)
        return
      }

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user?.email) {
        setProfile(null)
        return
      }

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: userData.user.email.split('@')[0],
          role: 'user'
        })

      if (insertError) {
        throw insertError
      }

      const { data: newData, error: newError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (newError) {
        throw newError
      }

      setProfile(newData ?? null)
    } catch (error: any) {
      setProfile(null)
      setError(error.message || 'Erro ao buscar perfil')
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    let mounted = true

    const withTimeout = async <T,>(promise: Promise<T>, ms: number) => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout ao carregar sessão')), ms)
        })
      ])
    }

    const init = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await withTimeout(supabase.auth.getSession(), 3000) as any

        if (!mounted) return

        if (error) {
          setSession(null)
          setUser(null)
          setProfile(null)
          setError(error.message)
        } else {
          setSession(data.session)
          setUser(data.session?.user ?? null)
        }
      } catch {
        if (!mounted) return
        setSession(null)
        setUser(null)
        setProfile(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let active = true

    setError(null)
    setProfile(null)

    if (!user) {
      return
    }

    ;(async () => {
      await fetchProfile(user.id)
    })()

    return () => {
      active = false
    }
  }, [user?.id])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('signIn error:', error)
        setError(error.message)
        setLoading(false)
        return { error }
      }
      
      setLoading(false)
      return { error: null }
    } catch (error: any) {
      setError(error.message)
      setLoading(false)
      return { error }
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })
      
      if (error) {
        setError(error.message)
      }
      
      return { error }
    } catch (error: any) {
      setError(error.message)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      await supabase.auth.signOut()
      // Limpar estado local imediatamente
      setUser(null)
      setProfile(null)
      setSession(null)
      setError(null)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    error,
    isAdmin,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
