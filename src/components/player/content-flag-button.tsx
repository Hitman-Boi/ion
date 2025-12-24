"use client";

import { useState } from "react";
import { Flag, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { submitContentFlag } from "@/app/actions/content-flag.actions";
import { FLAG_REASONS, type FlagReason } from "@/lib/content-flag-constants";

interface ContentFlagButtonProps {
    courseId: string;
}

export function ContentFlagButton({ courseId }: ContentFlagButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState<FlagReason | null>(null);
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!selectedReason) {
            setError("Please select a reason");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await submitContentFlag(
                courseId,
                selectedReason,
                details || undefined
            );
            setHasSubmitted(true);
            setTimeout(() => {
                setIsOpen(false);
                // Reset for next time
                setTimeout(() => {
                    setHasSubmitted(false);
                    setSelectedReason(null);
                    setDetails("");
                }, 300);
            }, 1500);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to submit flag");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    title="Report an issue"
                >
                    <Flag className="w-4 h-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
                {hasSubmitted ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-sm font-medium">Report Submitted</p>
                        <p className="text-xs text-muted-foreground text-center">
                            Thank you for helping improve this course
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <h4 className="font-medium text-sm">Report an Issue</h4>
                            <p className="text-xs text-muted-foreground">
                                Help us improve by reporting problems
                            </p>
                        </div>

                        <RadioGroup
                            value={selectedReason || ""}
                            onValueChange={(value) => setSelectedReason(value as FlagReason)}
                        >
                            {FLAG_REASONS.map((reason) => (
                                <div key={reason} className="flex items-center space-x-2">
                                    <RadioGroupItem value={reason} id={reason} />
                                    <Label htmlFor={reason} className="text-sm cursor-pointer">
                                        {reason}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>

                        <div className="space-y-2">
                            <Label htmlFor="details" className="text-xs text-muted-foreground">
                                Additional details (optional)
                            </Label>
                            <Textarea
                                id="details"
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="Describe the issue..."
                                className="resize-none text-sm"
                                rows={2}
                            />
                        </div>

                        {error && (
                            <p className="text-xs text-destructive">{error}</p>
                        )}

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsOpen(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSubmit}
                                disabled={!selectedReason || isSubmitting}
                                className="flex-1"
                            >
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </Button>
                        </div>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
