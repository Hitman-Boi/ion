"use client";

import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { User } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
    user: User & { role?: string }
}

export function Header({ user }: HeaderProps) {
    const pathname = usePathname()
    // @ts-ignore
    const isAdmin = user?.role === "ADMIN"

    const getPageTitle = (path: string) => {
        if (path.startsWith("/admin/roles")) return "Job Roles"
        if (path.startsWith("/admin")) return "Admin Dashboard"
        if (path.startsWith("/career")) return "Career Explorer"
        if (path.startsWith("/dashboard")) return "Dashboard"
        return "Learning Hub"
    }

    return (
        <header className="sticky top-0 z-10 w-full border-b bg-white dark:bg-gray-950 dark:border-gray-800">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-4">
                    <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
                        <span className="">{getPageTitle(pathname)}</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <Link
                            href="/dashboard"
                            className={`transition-colors hover:text-gray-900 dark:hover:text-gray-50 ${pathname === '/dashboard' ? 'text-gray-900 dark:text-gray-50 font-bold' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/career"
                            className={`transition-colors hover:text-gray-900 dark:hover:text-gray-50 ${pathname.startsWith('/career') ? 'text-gray-900 dark:text-gray-50 font-bold' : 'text-gray-500 dark:text-gray-400'}`}
                        >
                            Career
                        </Link>
                    </nav>
                </div>
                <nav className="flex items-center gap-4">
                    {isAdmin && (
                        <Button asChild variant="ghost">
                            <Link href="/admin">Admin</Link>
                        </Button>
                    )}
                    <form action={logout}>
                        <Button variant="ghost" type="submit">
                            Sign Out
                        </Button>
                    </form>
                </nav>
            </div>
        </header>
    )
}
