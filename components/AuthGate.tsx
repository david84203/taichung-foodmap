'use client'
import { useState, useEffect, ReactNode, FormEvent } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

// 私人站台共用帳號（在 Firebase 主控台建立）。只需輸入密碼即可登入。
const ADMIN_EMAIL = 'david84203@gmail.com'

export default function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser]             = useState<User | null>(null)
  const [ready, setReady]           = useState(false)
  const [password, setPassword]     = useState('')
  const [error, setError]           = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setReady(true) }), [])

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password)
    } catch {
      setError('密碼錯誤，請再試一次')
    } finally {
      setSubmitting(false)
    }
  }

  if (!ready) {
    return <div className="h-screen flex items-center justify-center text-gray-400">載入中…</div>
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-white px-4">
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4 text-center">
          <div className="text-4xl">🗺️</div>
          <h1 className="font-bold text-gray-800 text-lg">台中美食地圖</h1>
          <p className="text-sm text-gray-400">私人地圖，請輸入密碼</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="密碼"
            autoFocus
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !password}
            className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {submitting ? '登入中…' : '登入'}
          </button>
        </form>
      </div>
    )
  }

  return <>{children}</>
}
