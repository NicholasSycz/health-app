import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FormField from '../components/ui/FormField'
import ErrorMessage from '../components/ui/ErrorMessage'
import AuthLayout from '../components/layout/AuthLayout'
import Icon from '../components/ui/Icon'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (!email) errors.email = 'Email is required.'
    if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
    if (password !== confirm) errors.confirm = 'Passwords do not match.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setLoading(true)
    try {
      await register({ email, password })
      navigate('/dashboard')
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string } } }
        setError(axiosErr.response?.data?.detail ?? 'Registration failed.')
      } else {
        setError('Registration failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
      <h1>Make yourself a priority.</h1>
      <p className="auth-description">
        Create your account and take the first step toward your goals.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorMessage message={error} />}
        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          autoComplete="email"
          placeholder="you@example.com"
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
        <FormField
          id="confirm"
          label="Confirm Password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={fieldErrors.confirm}
          autoComplete="new-password"
          placeholder="Re-enter your password"
        />
        <button type="submit" disabled={loading} className="button-primary auth-submit">
          {loading ? 'Creating account…' : 'Create account'}
          <Icon name="arrow" size={17} />
        </button>
      </form>
      <p className="auth-switch">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Sign In
        </Link>
      </p>
      <p className="auth-footnote">One small step today. A healthier tomorrow.</p>
    </AuthLayout>
  )
}
