
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Info } from "lucide-react"

export default function InstructorGuidePage() {
    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">Instructor & Admin Guide</h1>
                <p className="text-xl text-muted-foreground">
                    Curriculum design in a Skills-First architecture.
                </p>
            </div>

            <div className="grid gap-8">
                <div className="border border-blue-200 bg-blue-50 p-4 rounded-md flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800">Philosophy Shift</h4>
                        <p className="text-sm text-blue-700">
                            You no longer create &quot;Learning Paths&quot; manually. You create <strong>Courses</strong> and define <strong>Roles</strong>. The system connects them automatically.
                        </p>
                    </div>
                </div>

                {/* Step 1: Defining Skills */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight border-b pb-2">1. Defining Skills</h2>
                    <p className="text-muted-foreground">
                        Skills are the glue of the platform. Before you create content, ensure the relevant Skills exist.
                    </p>
                    <Card>
                        <CardHeader>
                            <CardTitle>Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-sm">Navigate to <strong>Admin {'>'} Manage Skills</strong>.</p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground pl-4">
                                <li>Keep skills granular but meaningful (e.g., &quot;React Hooks&quot; vs just &quot;React&quot;).</li>
                                <li>Merge duplicate skills to prevent fragmentation.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </section>

                {/* Step 2: Tagging Courses */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight border-b pb-2">2. Tagging Courses</h2>
                    <p className="text-muted-foreground">
                        When creating or editing a Course, you must declare what skills it <strong>provides</strong>.
                    </p>
                    <div className="border rounded-md p-4 bg-muted/20">
                        <h4 className="font-semibold mb-2">Example: &quot;Advanced React Patterns&quot;</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            In the Course Settings, select:
                        </p>
                        <div className="flex gap-2">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">React.js</span>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Performance Optimization</span>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Design Patterns</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4 italic">
                            *Any student requiring these skills will now see this course in their path.*
                        </p>
                    </div>
                </section>

                {/* Step 3: Defining Roles */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight border-b pb-2">3. Creating Job Roles</h2>
                    <p className="text-muted-foreground">
                        Define the &quot;Destination&quot; for your learners.
                    </p>
                    <Card>
                        <CardContent className="pt-6">
                            <ol className="list-decimal list-inside space-y-2 text-sm">
                                <li>Go to <strong>Admin {'>'} Manage Roles</strong>.</li>
                                <li>Create a Role (e.g., &quot;Full Stack Developer&quot;).</li>
                                <li><strong>Crucial Step:</strong> Add &quot;Required Skills&quot; to this role.</li>
                            </ol>
                            <p className="mt-4 text-sm text-muted-foreground">
                                The more accurate your skill requirements, the better the automated recommendations will be.
                            </p>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    )
}
