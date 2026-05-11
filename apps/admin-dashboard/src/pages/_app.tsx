import '@/app/globals.css'
import type { AppProps } from 'next/app'
import AdminLayout from '@/layouts/AdminLayout'
import LandingLayout from '@/layouts/LandingLayout'
import AuthLayout from '@/layouts/AuthLayout'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  
  // Determine which layout to use based on route
  const getLayout = () => {
    const pathname = router.pathname
    
    // Landing page uses LandingLayout
    if (pathname === '/') {
      return LandingLayout
    }
    
    // Auth pages use AuthLayout
    if (pathname.startsWith('/auth')) {
      return AuthLayout
    }
    
    // All other pages use AdminLayout (protected routes)
    return AdminLayout
  }
  
  const Layout = getLayout()
  
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
