import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AuthCard from '../components/AuthCard'
import Alert from '../components/Alert'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    const { data, error: err } = await supabase.auth.signUp({ email, password })
    if (err) {
      setError(err.message)
    } else {
      if (data.session) {
        setSuccess('Account created. Redirecting…')
        setTimeout(() => navigate('/', { replace: true }), 800)
      } else {
        setSuccess('Account created. Please check your email to verify your account.')
      }
    }
    setLoading(false)
  }

  return (
    <AuthCard title="Create your account" subtitle="Get started with the CMS">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert kind="error">{error}</Alert>}
        {success && <Alert kind="success">{success}</Alert>}

        <div className="space-y-1">
          <label className="block text-sm text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/70"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            minLength={6}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/70"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black text-white py-2 font-medium disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create account'}
        </button>

        <p className="text-sm text-gray-500 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-gray-900 hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthCard>
  )
}
