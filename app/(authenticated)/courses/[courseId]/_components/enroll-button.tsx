"use client";

import { Button } from "@/components/ui/button";
import { enrollUser } from "@/app/actions/enrollment";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EnrollButtonProps {
    courseId: string;
}

export const EnrollButton = ({ courseId }: EnrollButtonProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const onEnroll = async () => {
        try {
            setIsLoading(true);
            await enrollUser(courseId);
            toast.success("Successfully enrolled!");
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button onClick={onEnroll} disabled={isLoading} size="lg" className="w-full md:w-auto">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Enroll Now
        </Button>
    );
};
