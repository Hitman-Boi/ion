"use client";

import { logout } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User as UserIcon, Settings, LogOut } from "lucide-react";
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

    const NavButton = ({ href, label, onClick, className = "" }: { href: string, label: string, onClick?: () => void, className?: string }) => {
        const isActive = isPathActive(href);
        return (
            <Button
                variant={isActive ? "secondary" : "ghost"}
                asChild
                className={`${className} ${isActive ? "bg-accent text-accent-foreground pointer-events-none opacity-100" : ""}`}
                aria-disabled={isActive}
                onClick={onClick}
            >
                <Link href={href} aria-disabled={isActive} tabIndex={isActive ? -1 : undefined}>
                    {label}
                </Link>
            </Button>
        )
    }

    const desktopNavigationItems = (
        <>
            <NavButton href="/learner-dashboard" label="Learner Dashboard" />

            {isInstructor && (
                <NavButton href="/instructor-dashboard" label="Instructor Dashboard" />
            )}

            {isAdmin && (
                <NavButton href="/admin" label="Admin Dashboard" />
            )}

        </>
    )

    const mobileNavigationItems = (
        <>
            <NavButton href="/learner-dashboard" label="Learner Dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start" />

            {isInstructor && (
                <NavButton href="/instructor-dashboard" label="Instructor Dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start" />
            )}

            {isAdmin && (
                <NavButton href="/admin" label="Admin Dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full justify-start" />
            )}

        </>
    )

    return (
        <header className="sticky top-0 z-10 w-full border-b bg-white dark:bg-gray-950 dark:border-gray-800">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                {/* Left Side: App Name + Navigation */}
                <div className="flex items-center gap-4">
                    <Link className="flex items-center gap-2 font-semibold text-lg whitespace-nowrap" href="/learner-dashboard">
                        <span>ION Learning Hub</span>
                    </Link>

                    {/* Desktop Navigation - Hidden on small/medium screens */}
                    <nav className="hidden lg:flex items-center gap-2">
                        {desktopNavigationItems}
                    </nav>
                </div>

                {/* Right Side: User Menu */}
                <div className="flex items-center gap-2">
                    {/* Mobile Menu Button - Visible on small/medium screens */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild className="lg:hidden">
                            <Button variant="ghost" size="icon" aria-label="Open menu">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle>Menu</SheetTitle>
                            </SheetHeader>
                            <nav className="flex flex-col gap-4 mt-8">
                                {/* User Info Section */}
                                <div className="pb-4 border-b">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                                            <UserIcon className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-sm font-medium leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground mt-1">{user.email}</p>
                                        </div>
                                    </div>

                                    {/* User Actions - Indented */}
                                    <div className="flex flex-col gap-2 pl-4 border-l-2 border-muted">
                                        <Button variant="ghost" asChild onClick={() => setMobileMenuOpen(false)} className="justify-start">
                                            <Link href="/settings">
                                                <Settings className="mr-2 h-4 w-4" />
                                                Settings
                                            </Link>
                                        </Button>
                                        <form action={logout}>
                                            <Button variant="ghost" type="submit" className="w-full justify-start">
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Sign Out
                                            </Button>
                                        </form>
                                    </div>
                                </div>

                                {/* Navigation Items */}
                                <div className="space-y-2">
                                    {mobileNavigationItems}
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>

                    {/* User Dropdown Menu - Desktop Only */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className="hidden lg:flex">
                            <Button variant="ghost" size="icon" aria-label="User menu">
                                <UserIcon className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <form action={logout} className="w-full">
                                    <button type="submit" className="flex w-full items-center cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Sign Out
                                    </button>
                                </form>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
