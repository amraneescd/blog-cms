import type { ReactNode } from 'react'

interface AlertProps {
  kind?: 'success' | 'error' | 'info'
  children: ReactNode
}

export default function Alert({ kind = 'info', children }: AlertProps) {
  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  } as const

  return (
    <div className={`rounded-md border px-3 py-2 text-sm ${styles[kind]}`}>
      {children}
    </div>
  )
}
