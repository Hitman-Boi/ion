import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import './globals.css'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Footer from './components/Footer'

export default function Layout({ children }: { children: React.ReactNode }) {
  const session = auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}
