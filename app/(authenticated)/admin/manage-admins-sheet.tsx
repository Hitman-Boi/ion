"use client"

import { getNonAdminUsers, promoteToAdmin, updateUserGlobalRole } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { User } from "@prisma/client"
import { Check, ChevronsUpDown, Trash2, Shield, UserPlus } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface ManageAdminsSheetProps {
    initialAdmins: User[]
}

export function ManageAdminsSheet({ initialAdmins }: ManageAdminsSheetProps) {
    const [open, setOpen] = useState(false)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isRemoving, setIsRemoving] = useState<string | null>(null)
    const [users, setUsers] = useState<{ id: string; email: string; name: string | null }[]>([])
    const router = useRouter()

    useEffect(() => {
        if (open) {
            getNonAdminUsers().then(setUsers)
        }
    }, [open])

    async function onAddAdmin(e: React.FormEvent) {
        e.preventDefault()
        if (!email) return

        setIsLoading(true)
        try {
            await promoteToAdmin(email)
            setEmail("")
            // Refresh to update the parent server component/initialAdmins
            router.refresh()
        } catch (error) {
            console.error("Failed to add admin", error)
            alert("Failed to add admin. Please check if the email is correct.")
        } finally {
            setIsLoading(false)
        }
    }

    async function onRemoveAdmin(userId: string) {
        setIsRemoving(userId)
        try {
            await updateUserGlobalRole(userId, "STUDENT")
            router.refresh()
        } catch (error) {
            console.error("Failed to remove admin", error)
            alert("Failed to remove admin.")
        } finally {
            setIsRemoving(null)
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Shield className="h-4 w-4" />
                    Manage Admins
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col h-full">
                <SheetHeader>
                    <SheetTitle>Manage Administrators</SheetTitle>
                    <SheetDescription>
                        Add or remove administrators for the platform.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 flex flex-col gap-6 mt-6 overflow-hidden">
                    {/* Add Admin Section */}
                    <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Add New Admin
                        </h3>
                        <form onSubmit={onAddAdmin} className="space-y-4">
                            <div className="space-y-2 flex flex-col">
                                <label htmlFor="select-user" className="text-sm font-medium leading-none text-muted-foreground">
                                    Select User to Promote
                                </label>
                                <div className="flex gap-2">
                                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="select-user"
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={popoverOpen}
                                                className="flex-1 justify-between"
                                            >
                                                {email
                                                    ? users.find((user) => user.email === email)?.email || email
                                                    : "Select user..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0 z-[20000]">
                                            <Command>
                                                <CommandInput placeholder="Search user..." />
                                                <CommandList>
                                                    <CommandEmpty>No user found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {users.map((user) => (
                                                            <CommandItem
                                                                key={user.id}
                                                                value={user.email}
                                                                onSelect={(currentValue) => {
                                                                    setEmail(currentValue === email ? "" : currentValue)
                                                                    setPopoverOpen(false)
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        email === user.email ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span>{user.email}</span>
                                                                    {user.name && (
                                                                        <span className="text-xs text-muted-foreground">{user.name}</span>
                                                                    )}
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <Button type="submit" disabled={isLoading || !email}>
                                        {isLoading ? "Adding..." : "Add"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Admin List Section */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <h3 className="text-sm font-medium mb-4">Current Admins ({initialAdmins.length})</h3>
                        <ScrollArea className="flex-1 -mr-4 pr-4">
                            <div className="space-y-3 pb-6">
                                {initialAdmins.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
                                        <div className="overflow-hidden">
                                            <p className="font-medium truncate text-sm">{user.name || "No Name"}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                        {(user.email !== "admin@example.com" && initialAdmins.length > 1) && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                disabled={isRemoving === user.id}
                                                onClick={() => onRemoveAdmin(user.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Remove admin role</span>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
