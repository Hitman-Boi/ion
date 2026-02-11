import { auth } from "@/auth"
import { Header } from "./_components/header"
import { isUserInstructor } from "@/app/actions/instructor.actions"

// Mock admin user for development - skips login
const MOCK_ADMIN_USER = {
    id: "mock-admin-user",
    name: "Admin User",
    email: "admin@ionlearninghub.com",
    role: "ADMIN",
}

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    // Use real session if available, otherwise fall back to mock admin user
    const user = session?.user ?? MOCK_ADMIN_USER
    const userId = user.id ?? MOCK_ADMIN_USER.id
    const isInstructor = session?.user ? await isUserInstructor(userId) : true

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            <Header user={{ ...user, role: (user as any).role ?? "ADMIN" } as any} isInstructor={isInstructor} />
            <div className="flex-1 min-h-0 flex flex-col overflow-y-auto bg-[#0f1115]">
                {children}
            </div>
        </div>
    )
}
