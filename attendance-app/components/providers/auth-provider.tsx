"use client"
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  approved: boolean
  year?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: auth0User, isLoading: auth0Loading, error } = useUser()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // Fetch user profile from Supabase when Auth0 user is available
  const fetchUserProfile = useCallback(async (email: string) => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !anonKey) {
        console.error('Missing Supabase environment variables')
        setProfileLoading(false)
        return
      }

      const response = await fetch(
        `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=id,email,name,role,approved,year`,
        {
          headers: {
            'apikey': anonKey,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        console.error('Failed to fetch user profile:', response.status)
        setProfileLoading(false)
        return
      }

      const users = await response.json()
      if (users && users.length > 0) {
        setUser(users[0] as AuthUser)
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
    } finally {
      setProfileLoading(false)
    }
  }, [])

  useEffect(() => {
    if (auth0Loading) return

    if (auth0User?.email) {
      fetchUserProfile(auth0User.email)
    } else {
      setUser(null)
      setProfileLoading(false)
    }
  }, [auth0User, auth0Loading, fetchUserProfile])

  if (error) {
    console.error('Auth0 error:', error)
  }

  const loading = auth0Loading || profileLoading
  const isAuthenticated = !!auth0User && !!user

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
