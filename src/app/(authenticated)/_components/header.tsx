"use client";

import { logout } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { User } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
    user: User & { role?: string }
    isInstructor?: boolean
}

export function Header({ user, isInstructor }: HeaderProps) {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    // @ts-ignore
    const isAdmin = user?.role === "ADMIN"

    const isPathActive = (path: string) => {
        if (path === "/learner-dashboard") {
            return pathname.startsWith("/learner-dashboard");
        }
        return pathname.startsWith(path);
    }

    const NavButton = ({ href, label, onClick }: { href: string, label: string, onClick?: () => void }) => {
        const isActive = isPathActive(href);
        return (
            <Button
                variant={isActive ? "secondary" : "ghost"}
                asChild
                className={isActive ? "bg-accent text-accent-foreground pointer-events-none opacity-100" : ""}
                aria-disabled={isActive}
                onClick={onClick}
            >
                <Link href={href} aria-disabled={isActive} tabIndex={isActive ? -1 : undefined}>
                    {label}
                </Link>
            </Button>
        )
    }

    const navigationItems = (
        <>
            <NavButton href="/learner-dashboard" label="Learner Dashboard" onClick={() => setMobileMenuOpen(false)} />

            {isInstructor && (
                <NavButton href="/instructor-dashboard" label="Instructor Dashboard" onClick={() => setMobileMenuOpen(false)} />
            )}

            {isAdmin && (
                <NavButton href="/admin" label="Admin Dashboard" onClick={() => setMobileMenuOpen(false)} />
            )}

            <NavButton href="/career" label="Career" onClick={() => setMobileMenuOpen(false)} />

            <form action={logout}>
                <Button variant="ghost" type="submit" className="w-full">
                    Sign Out
                </Button>
            </form>
        </>
    )

    return (
        <header className="sticky top-0 z-10 w-full border-b bg-white dark:bg-gray-950 dark:border-gray-800">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-4">
                    <Link className="flex items-center gap-2 font-semibold text-lg" href="/learner-dashboard">
                        <span>ION Learning Hub</span>
                    </Link>
                </div>

                {/* Desktop Navigation - Hidden on small/medium screens */}
                <nav className="hidden lg:flex items-center gap-2">
                    {navigationItems}
                </nav>

                {/* Mobile Menu Button - Visible on small/medium screens */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild className="lg:hidden">
                        <Button variant="ghost" size="icon" aria-label="Open menu">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                        <SheetHeader>
                            <SheetTitle>Navigation</SheetTitle>
                        </SheetHeader>
                        <nav className="flex flex-col gap-4 mt-8">
                            {navigationItems}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}
