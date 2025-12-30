import { LoginForm } from "@/components/auth/login-form"

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = await searchParams

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
            <LoginForm errorId={error} errorRedirectPath="/login" />
        </div>
    )
}
