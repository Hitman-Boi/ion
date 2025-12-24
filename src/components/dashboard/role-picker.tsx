"use client"

import { addTargetRole, removeTargetRole } from "@/app/actions/user-goals.actions"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"

interface RolePickerProps {
    roles: any[]
    userTargetRoleIds?: string[] // IDs of roles user already has
}

export function RolePicker({ roles, userTargetRoleIds = [] }: RolePickerProps) {
    const router = useRouter()

    const handleToggleRole = async (roleId: string, isSelected: boolean) => {
        try {
            if (isSelected) {
                await removeTargetRole(roleId)
                toast.success("Goal removed")
            } else {
                await addTargetRole(roleId)
                toast.success("Goal added! Check your dashboard.")
            }
            router.refresh()
        } catch (error) {
            toast.error(isSelected ? "Failed to remove goal" : "Failed to add goal")
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => {
                const isSelected = userTargetRoleIds.includes(role.id)
                return (
                    <Card key={role.id} className={`cursor-pointer transition-all ${isSelected ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{role.title}</CardTitle>
                                {isSelected && <Check className="h-5 w-5 text-primary" />}
                            </div>
                            <CardDescription>{role.description}</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button
                                className="w-full"
                                variant={isSelected ? "outline" : "default"}
                                onClick={() => handleToggleRole(role.id, isSelected)}
                            >
                                {isSelected ? "Remove Goal" : "Select this Path"}
                            </Button>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
    )
}
