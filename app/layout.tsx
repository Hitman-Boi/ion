import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import './globals.css'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learning Hub',
  description: 'Unlock your potential with our curated courses.',
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex flex-1">
            {session && <Sidebar />}
            <main className="flex-1 p-4">
              {children}
            </main>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  )
}
