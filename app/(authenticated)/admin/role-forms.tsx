"use client"

import { updateUserGlobalRole, updateCourseEnrollmentRole } from "@/app/actions/admin"
import { Role, CourseRole } from "@prisma/client"

export function UserRoleForm({ userId, currentRole }: { userId: string, currentRole: Role }) {
    return (
        <form action={async (formData) => {
            const role = formData.get("role") as Role
            await updateUserGlobalRole(userId, role)
        }}>
            <select
                name="role"
                defaultValue={currentRole}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                onChange={(e) => e.target.form?.requestSubmit()}
            >
                {Object.values(Role).map((role) => (
                    <option key={role} value={role}>{role}</option>
                ))}
            </select>
        </form>
    )
}

export function EnrollmentRoleForm({ courseId, userId, currentRole }: { courseId: string, userId: string, currentRole: CourseRole }) {
    return (
        <form action={async (formData) => {
            const role = formData.get("role") as CourseRole
            await updateCourseEnrollmentRole(courseId, userId, role)
        }}>
            <select
                name="role"
                defaultValue={currentRole}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                onChange={(e) => e.target.form?.requestSubmit()}
            >
                {Object.values(CourseRole).map((role) => (
                    <option key={role} value={role}>{role}</option>
                ))}
            </select>
        </form>
    )
}
