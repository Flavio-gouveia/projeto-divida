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

  const createProfileIfNotExists = async (userId: string, email?: string) => {
    try {
      // Tentar buscar profile primeiro
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Erro real (não é "not found")
        console.error('Error fetching profile:', fetchError)
        setError(fetchError.message)
        return
      }

      // Se profile não existe, criar um
      if (!data && fetchError?.code === 'PGRST116') {
        console.log('Profile not found, creating new one for user:', userId)
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            name: email?.split('@')[0] || 'Usuário',
            role: 'user'
          })

        if (insertError) {
          console.error('Error creating profile:', insertError)
          setError(insertError.message)
          return
        }

        // Buscar o profile recém-criado
        const { data: newProfile, error: newFetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (newFetchError) {
          console.error('Error fetching new profile:', newFetchError)
          setError(newFetchError.message)
        } else {
          setProfile(newProfile)
          console.log('Profile created successfully:', newProfile)
        }
      } else if (data) {
        // Profile existe
        setProfile(data)
        console.log('Profile loaded:', data)
      }
    } catch (error: any) {
      console.error('Error in createProfileIfNotExists:', error)
      setError(error.message)
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // Se não encontrar profile, tenta criar um
        if (error.code === 'PGRST116') {
          const { data: userData } = await supabase.auth.getUser()
          if (userData.user?.email) {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                name: userData.user.email.split('@')[0],
                role: 'user'
              })
            
            if (!insertError) {
              // Tenta buscar novamente
              const { data: newData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()
              
              if (newData) {
                setProfile(newData)
                return
              }
            }
          }
        }
        throw error
      }

      setProfile(data)
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      setError(error.message || 'Erro ao buscar perfil')
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      console.log('Refreshing profile for user:', user.id)
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    let mounted = true

    const getSession = async () => {
      try {
        console.log('Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setError(error.message)
          setLoading(false)
          return
        }

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            console.log('Session found, loading profile for:', session.user.id)
            await fetchProfile(session.user.id)
          }
          
          setLoading(false)
        }
      } catch (error: any) {
        console.error('Error in getSession:', error)
        if (mounted) {
          setError(error.message)
          setLoading(false)
        }
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id)
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
          }
          
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
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
