import '@/app/globals.css'
import type { AppProps } from 'next/app'
import AdminLayout from '@/layouts/AdminLayout'

export default function App({ Component, pageProps }: AppProps) {
  // Skip layout for auth pages
  const isAuthPage = Component.displayName?.includes('Auth') || 
                    (Component as any)?.isAuthPage ||
                    typeof window !== 'undefined' && 
                    window.location.pathname.startsWith('/auth')

  if (isAuthPage) {
    return <Component {...pageProps} />
  }

  return (
    <AdminLayout>
      <Component {...pageProps} />
    </AdminLayout>
  )
}
