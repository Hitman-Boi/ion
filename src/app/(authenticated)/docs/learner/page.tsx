
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Target, Zap, BookOpen } from "lucide-react"

export default function LearnerGuidePage() {
    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">Learner User Guide</h1>
                <p className="text-xl text-muted-foreground">
                    Master your career path with our Skills-First learning engine.
                </p>
            </div>

            <div className="grid gap-8">
                {/* Section 1: The Concept */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight border-b pb-2">1. How It Works</h2>
                    <p className="text-muted-foreground">
                        Unlike traditional platforms that just give you a list of courses, we focus on <strong>Skills</strong> and <strong>Roles</strong>.
                    </p>

                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                        <Card>
                            <CardHeader>
                                <Target className="w-8 h-8 mb-2 text-primary" />
                                <CardTitle>Pick a Role</CardTitle>
                                <CardDescription>Your Destination</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Choose a target job role (e.g., &quot;Senior Frontend Dev&quot;). This sets your goal.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <Zap className="w-8 h-8 mb-2 text-yellow-500" />
                                <CardTitle>Gain Skills</CardTitle>
                                <CardDescription>Your Currency</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Roles are just collections of skills. Using React? That&apos;s a skill. Deployment? Another skill.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <BookOpen className="w-8 h-8 mb-2 text-blue-500" />
                                <CardTitle>Dynamic Path</CardTitle>
                                <CardDescription>Your Map</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">We automatically find the courses that teach the skills you are missing.</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Section 2: Getting Started */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight border-b pb-2">2. Getting Started</h2>

                    <div className="bg-muted/30 p-6 rounded-lg border space-y-4">
                        <div className="flex gap-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
                            <div>
                                <h3 className="font-semibold mb-1">Set Your Target Role</h3>
                                <p className="text-sm text-muted-foreground">Go to your Dashboard settings or Profile and select a &apos;Target Role&apos;.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">2</div>
                            <div>
                                <h3 className="font-semibold mb-1">View Your Gap Analysis</h3>
                                <p className="text-sm text-muted-foreground">The system will show you exactly what skills you have vs. what you need.</p>
                                <div className="mt-2 flex gap-2">
                                    <Badge variant="secondary">React <span className="text-xs ml-1 text-green-500">✓</span></Badge>
                                    <Badge variant="outline">Next.js <span className="text-xs ml-1 text-red-500">Missing</span></Badge>
                                    <Badge variant="outline">GraphQL <span className="text-xs ml-1 text-red-500">Missing</span></Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">3</div>
                            <div>
                                <h3 className="font-semibold mb-1">Start Your Personalized Path</h3>
                                <p className="text-sm text-muted-foreground">Your dashboard will populate with specific courses recommended just for you to close those gaps.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
