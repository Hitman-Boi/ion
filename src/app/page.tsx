import { redirect } from 'next/navigation'

export default async function Home() {
    // Skip login - redirect directly to admin dashboard
    redirect('/admin-dashboard')
}
