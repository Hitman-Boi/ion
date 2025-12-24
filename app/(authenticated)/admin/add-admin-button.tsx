"use client"

import { useState, useEffect } from "react"
import { promoteToAdmin, getNonAdminUsers } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function AddAdminButton() {
    const [open, setOpen] = useState(false)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [users, setUsers] = useState<{ id: string; email: string; name: string | null }[]>([])

    useEffect(() => {
        if (open) {
            getNonAdminUsers().then(setUsers)
        }
    }, [open])

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!email) return

        setIsLoading(true)
        try {
            await promoteToAdmin(email)
            setOpen(false)
            setEmail("")
        } catch (error) {
            console.error("Failed to add admin", error)
            alert("Failed to add admin. Please check if the email is correct.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                    Add Admin
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Add New Admin</SheetTitle>
                    <SheetDescription>
                        Search for a user to promote to Admin.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={onSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2 flex flex-col">
                        <label htmlFor="select-user" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Select User
                        </label>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    id="select-user"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={popoverOpen}
                                    className="w-full justify-between"
                                >
                                    {email
                                        ? users.find((user) => user.email === email)?.email || email
                                        : "Select user..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
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
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading || !email}>
                            {isLoading ? "Adding..." : "Add Admin"}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}
