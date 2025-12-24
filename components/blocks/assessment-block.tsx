"use client";
import { CourseBlock } from "@prisma/client";
import { Button } from "@/components/ui/button";

export function AssessmentBlock({ block }: { block: CourseBlock }) {
    // TODO: Implement full assessment logic with state and submission
    return (
        <div className="border p-4 rounded-md bg-card">
            <h3 className="font-bold mb-2">Assessment</h3>
            <div className="text-sm text-muted-foreground mb-4">
                Problem ID: {block.id}
            </div>
            <Button>Submit Answer</Button>
        </div>
    );
}
