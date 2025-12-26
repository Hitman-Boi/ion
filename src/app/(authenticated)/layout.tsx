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
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            <Header user={session.user} isInstructor={isInstructor} />
            <div className="flex-1 min-h-0 flex flex-col overflow-y-auto bg-[#0f1115]">
                {children}
            </div>
        </div>
    )
}
