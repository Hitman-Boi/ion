import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    redirect('/auth/signin')
  }

  return children
}
