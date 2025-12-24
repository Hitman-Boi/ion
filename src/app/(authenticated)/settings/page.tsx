import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default async function SettingsPage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/login")
    }

    return (
        <div className="container max-w-4xl py-8 px-4 md:px-6">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <Separator />

                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>
                            Your personal information and account details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <div className="flex flex-col space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Name</span>
                                <span className="text-base">{session.user.name || "Not set"}</span>
                            </div>
                        </div>
                        <Separator />
                        <div className="grid gap-2">
                            <div className="flex flex-col space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">Email</span>
                                <span className="text-base">{session.user.email || "Not set"}</span>
                            </div>
                        </div>
                        <Separator />
                        <div className="grid gap-2">
                            <div className="flex flex-col space-y-1">
                                <span className="text-sm font-medium text-muted-foreground">User ID</span>
                                <span className="text-base font-mono text-sm">{session.user.id}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Preferences Section - Placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle>Preferences</CardTitle>
                        <CardDescription>
                            Customize your learning experience.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Preference settings coming soon...
                        </p>
                    </CardContent>
                </Card>

                {/* Notifications Section - Placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>
                            Manage how you receive notifications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Notification settings coming soon...
                        </p>
                    </CardContent>
                </Card>

                {/* Privacy & Security Section - Placeholder */}
                <Card>
                    <CardHeader>
                        <CardTitle>Privacy & Security</CardTitle>
                        <CardDescription>
                            Control your privacy and security settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Privacy and security settings coming soon...
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
