import type { ReactNode } from 'react'

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`rounded-lg border bg-white shadow-sm ${className}`}>{children}</div>
  )
}

export function CardHeader({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`p-4 border-b ${className}`}>{children}</div>
  )
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>
}

export function CardDescription({ children }: { children: ReactNode }) {
  return <p className="text-sm text-gray-600 mt-1">{children}</p>
}

export function CardContent({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`p-4 ${className}`}>{children}</div>
}
