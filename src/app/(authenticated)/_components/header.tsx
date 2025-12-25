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
import { Menu, User as UserIcon, Settings, LogOut, GraduationCap, Presentation, Shield, LucideIcon } from "lucide-react";
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

    // Desktop NavButton - shows icon + text
    const NavButton = ({
        href,
        label,
        icon: Icon,
        onClick,
        className = ""
    }: {
        href: string,
        label: string,
        icon?: LucideIcon,
        onClick?: () => void,
        className?: string
    }) => {
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
                    {Icon && <Icon className="h-4 w-4 mr-1.5" />}
                    {label}
                </Link>
            </Button>
        )
    }

    // Tablet NavButton - shows icon only (or icon + text on wider tablets)
    const TabletNavButton = ({
        href,
        label,
        icon: Icon
    }: {
        href: string,
        label: string,
        icon: LucideIcon
    }) => {
        const isActive = isPathActive(href);
        return (
            <Button
                variant={isActive ? "secondary" : "ghost"}
                asChild
                size="icon"
                className={`${isActive ? "bg-accent text-accent-foreground pointer-events-none opacity-100" : ""}`}
                aria-disabled={isActive}
                title={label}
            >
                <Link href={href} aria-disabled={isActive} tabIndex={isActive ? -1 : undefined}>
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">{label}</span>
                </Link>
            </Button>
        )
    }

    const desktopNavigationItems = (
        <>
            <NavButton href="/learner-dashboard" label="Learner Dashboard" icon={GraduationCap} />

            {isInstructor && (
                <NavButton href="/instructor-dashboard" label="Instructor Dashboard" icon={Presentation} />
            )}

            {isAdmin && (
                <NavButton href="/admin-dashboard" label="Admin Dashboard" icon={Shield} />
            )}

        </>
    )

    const tabletNavigationItems = (
        <>
            <TabletNavButton href="/learner-dashboard" label="Learner Dashboard" icon={GraduationCap} />

            {isInstructor && (
                <TabletNavButton href="/instructor-dashboard" label="Instructor Dashboard" icon={Presentation} />
            )}

            {isAdmin && (
                <TabletNavButton href="/admin-dashboard" label="Admin Dashboard" icon={Shield} />
            )}

        </>
    )

    const mobileNavigationItems = (
        <>
            <NavButton href="/learner-dashboard" label="Learner Dashboard" icon={GraduationCap} onClick={() => setMobileMenuOpen(false)} className="w-full justify-start" />

            {isInstructor && (
                <NavButton href="/instructor-dashboard" label="Instructor Dashboard" icon={Presentation} onClick={() => setMobileMenuOpen(false)} className="w-full justify-start" />
            )}

            {isAdmin && (
                <NavButton href="/admin-dashboard" label="Admin Dashboard" icon={Shield} onClick={() => setMobileMenuOpen(false)} className="w-full justify-start" />
            )}

        </>
    )

    return (
        <header className="sticky top-0 z-10 w-full border-b bg-white dark:bg-gray-950 dark:border-gray-800">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                {/* Left Side: App Name + Navigation */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 font-semibold text-lg whitespace-nowrap">
                        <span>ION Learning Hub</span>
                    </div>

                    {/* Tablet Navigation - Icons only, visible on md screens */}
                    <nav className="hidden md:flex lg:hidden items-center gap-1 ml-4">
                        {tabletNavigationItems}
                    </nav>

                    {/* Desktop Navigation - Icons + Text, visible on lg+ screens */}
                    <nav className="hidden lg:flex items-center gap-2 ml-4">
                        {desktopNavigationItems}
                    </nav>
                </div>

                {/* Right Side: User Menu */}
                <div className="flex items-center gap-2">
                    {/* Mobile Menu Button - Only visible on small screens (below md) */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild className="md:hidden">
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
                        <DropdownMenuContent align="end" className="min-w-max">
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
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => logout()}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
