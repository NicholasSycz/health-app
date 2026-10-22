import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as authApi from '../api/auth'
import type { UserCredentials } from '../types/auth'

interface AuthContextValue {
  isAuthenticated: boolean
  email: string | null
  login: (credentials: UserCredentials) => Promise<void>
  register: (credentials: UserCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem('email'))

  const login = useCallback(async (credentials: UserCredentials) => {
    const res = await authApi.login(credentials)
    localStorage.setItem('token', res.access_token)
    localStorage.setItem('email', credentials.email)
    setToken(res.access_token)
    setEmail(credentials.email)
  }, [])

  const register = useCallback(async (credentials: UserCredentials) => {
    const res = await authApi.register(credentials)
    localStorage.setItem('token', res.access_token)
    localStorage.setItem('email', credentials.email)
    setToken(res.access_token)
    setEmail(credentials.email)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    setToken(null)
    setEmail(null)
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated: !!token, email, login, register, logout }),
    [token, email, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
