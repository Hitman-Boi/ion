import { auth } from "@/auth"
import { Header } from "./_components/header"
import { redirect } from "next/navigation"
import { isUserInstructor } from "@/app/actions/instructor.actions"

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    const isInstructor = await isUserInstructor(session.user.id!)

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header user={session.user} isInstructor={isInstructor} />
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </div>
    )
}
