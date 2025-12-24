import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { AuthError } from "next-auth"
import { isRedirectError } from "next/dist/client/components/redirect"
import { redirect } from "next/navigation"

function MicrosoftIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 21 21"
        >
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </svg>
    )
}

export default function LoginPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md space-y-8 rounded-xl border bg-white p-10 shadow-lg dark:border-gray-800 dark:bg-gray-950">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Welcome back</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Sign in to your account to continue
                    </p>
                </div>

                <div className="space-y-6">
                    <form
                        action={async () => {
                            "use server"
                            await signIn("microsoft-entra-id", { redirectTo: "/learner-dashboard" })
                        }}
                    >
                        <Button className="w-full h-11 text-base relative" variant="outline" type="submit">
                            <MicrosoftIcon className="mr-2 h-5 w-5 absolute left-4" />
                            Sign in with Microsoft
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200 dark:border-gray-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <form
                        action={async (formData) => {
                            "use server"
                            try {
                                await signIn("credentials", {
                                    email: formData.get("email"),
                                    password: formData.get("password"),
                                    redirectTo: "/learner-dashboard",
                                })
                            } catch (error) {
                                // On successful login, NextAuth throws a redirect error which we need to re-throw
                                if (isRedirectError(error)) {
                                    throw error
                                }
                                if (error instanceof AuthError) {
                                    return redirect(`/login?error=${error.type}`)
                                }
                                throw error
                            }
                        }}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300"
                                htmlFor="email"
                            >
                                Email
                            </label>
                            <input
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:border-gray-800"
                                id="email"
                                name="email"
                                placeholder="m@example.com"
                                required
                                type="email"
                            />
                        </div>
                        <div className="space-y-2">
                            <label
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300"
                                htmlFor="password"
                            >
                                Password
                            </label>
                            <input
                                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:border-gray-800"
                                id="password"
                                name="password"
                                required
                                type="password"
                            />
                        </div>
                        <Button className="w-full h-11 text-base" type="submit">
                            Sign In
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
