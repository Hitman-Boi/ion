import { getPublicLearningPaths } from "@/app/actions/learning-paths.actions";
import { SearchInput } from "../courses/_components/search-input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Route, Map as MapIcon, ArrowRight } from "lucide-react";

interface LearningPathsPageProps {
    searchParams: {
        term?: string;
    };
}

export const dynamic = "force-dynamic";

export default async function LearningPathsPage({
    searchParams,
}: LearningPathsPageProps) {
    const paths = await getPublicLearningPaths(searchParams);

    return (
        <div className="p-6 md:p-8 space-y-8 min-h-screen bg-[#0f1115] text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Learning Paths</h1>
                    <p className="text-muted-foreground">
                        Structured logic to guide you from beginner to expert.
                    </p>
                </div>
                <SearchInput />
            </div>

            {/* Path Grid */}
            {paths.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Route className="h-14 w-14 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No learning paths found</p>
                    <p className="text-sm">Try adjusting your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paths.map((path) => (
                        <Card key={path.id} className="flex flex-col border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-all">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5">
                                        {path.level}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                        {path._count.items} Steps
                                    </Badge>
                                </div>
                                <CardTitle className="line-clamp-1 text-lg">{path.title}</CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[40px]">
                                    {path.description || "No description available"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {path.roles.slice(0, 3).map(role => (
                                        <Badge key={role.id} variant="secondary" className="text-[10px] bg-secondary/50">
                                            {role.title}
                                        </Badge>
                                    ))}
                                    {path.roles.length > 3 && (
                                        <Badge variant="secondary" className="text-[10px] bg-secondary/50">
                                            +{path.roles.length - 3}
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full group">
                                    {/* Note: In a real app we might have a specific path details page /paths/[id]
                                        For now, since we don't have a specific public route for a path detail 
                                        defined in the prompt, let's assume it leads to a view or expands.
                                        However, the user wants "My Career Paths" on the dashboard.
                                        Let's link to a placeholder or stay here. 
                                        Wait, the user has /learning-paths check in the task.
                                        Let's assume there isn't a detail page yet, so maybe just a button "View Details" 
                                        that (for now) does nothing or goes to the dashboard to "Add"?
                                        Actually, usually you'd want to "Start" this path.
                                        I'll link to `#` for now or maybe `/learner-dashboard` if it adds it?
                                        The user's request was to "explore more career paths".
                                        Let's make it simple.
                                     */}
                                    <Link href={`#`}>
                                        View Path <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
