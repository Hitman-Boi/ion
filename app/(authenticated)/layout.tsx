import { auth } from "@/auth"
import { Header } from "./_components/header"
import { redirect } from "next/navigation"

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header user={session.user} />
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </div>
    )
}
