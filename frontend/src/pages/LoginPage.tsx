import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FormField from '../components/ui/FormField'
import ErrorMessage from '../components/ui/ErrorMessage'
import AuthLayout from '../components/layout/AuthLayout'
import Icon from '../components/ui/Icon'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } }
        setError(axiosErr.response?.data?.detail ?? 'Login failed.')
      } else {
        setError('Login failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <p className="eyebrow">GOOD TO SEE YOU AGAIN</p>
      <h1>Welcome back.</h1>
      <p className="auth-description">Your goals are waiting. Let’s pick up where you left off.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorMessage message={error} />}
        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="Enter your password"
        />
        <button type="submit" disabled={loading} className="button-primary auth-submit">
          {loading ? 'Signing in…' : 'Sign in'}
          <Icon name="arrow" size={17} />
        </button>
      </form>
      <p className="auth-switch">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline">
          Get started
        </Link>
      </p>
      <p className="auth-footnote">Small steps. A healthier you.</p>
    </AuthLayout>
  )
}
