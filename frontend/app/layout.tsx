import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import { AuthProvider } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'FloraPetFriend — Identifica y cuida tus animales y plantas',
  description:
    'Identifica animales y plantas con IA, crea tu mascota virtual educativa y recibe recordatorios de cuidado personalizados.',
  metadataBase: new URL('https://florapetfriend.site'),
  openGraph: {
    title: 'FloraPetFriend',
    description: 'Tu compañero inteligente para animales y plantas',
    url: 'https://florapetfriend.site',
    siteName: 'FloraPetFriend',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FloraPetFriend',
    description: 'Identifica animales y plantas con IA',
  },
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '16px', fontFamily: 'var(--font-inter)' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
