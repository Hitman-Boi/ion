"use client"

import { enrollUserInCourse, getUnenrolledUsers } from "@/app/actions/admin.actions"
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
import { cn } from "@/lib/utils"
import { CourseRole } from "@prisma/client"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { useEffect, useState } from "react"

interface AddEnrollmentButtonProps {
    courseId: string
    role: CourseRole
}

export function AddEnrollmentButton({ courseId, role }: AddEnrollmentButtonProps) {
    const [open, setOpen] = useState(false)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [users, setUsers] = useState<{ id: string; email: string; name: string | null }[]>([])

    useEffect(() => {
        if (open) {
            getUnenrolledUsers(courseId).then(setUsers)
        }
    }, [open, courseId])

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedUserId) return

        setIsLoading(true)
        try {
            await enrollUserInCourse(courseId, selectedUserId, role)
            setOpen(false)
            setSelectedUserId("")
        } catch (error) {
            console.error("Failed to enroll user", error)
            alert("Failed to enroll user.")
        } finally {
            setIsLoading(false)
        }
    }

    const formatRole = (r: string) => r.charAt(0) + r.slice(1).toLowerCase()

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add {formatRole(role)}
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Add {formatRole(role)}</SheetTitle>
                    <SheetDescription>
                        Search for a user to enroll as a {formatRole(role)}.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={onSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2 flex flex-col">
                        <label className="text-sm font-medium leading-none">
                            Select User
                        </label>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={popoverOpen}
                                    className="w-full justify-between"
                                >
                                    {selectedUserId
                                        ? users.find((user) => user.id === selectedUserId)?.email
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
                                                    value={user.email} // Search by email
                                                    onSelect={() => {
                                                        setSelectedUserId(user.id)
                                                        setPopoverOpen(false)
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedUserId === user.id ? "opacity-100" : "opacity-0"
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
                        <Button type="submit" disabled={isLoading || !selectedUserId}>
                            {isLoading ? "Adding..." : "Add"}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}
