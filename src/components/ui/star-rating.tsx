"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
    size?: "sm" | "md" | "lg";
    showValue?: boolean;
}

const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
};

export function StarRating({
    value,
    onChange,
    readonly = false,
    size = "md",
    showValue = false,
}: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState(0);

    const displayValue = hoverValue || value;

    const handleClick = (star: number) => {
        if (!readonly && onChange) {
            onChange(star);
        }
    };

    const handleMouseEnter = (star: number) => {
        if (!readonly) {
            setHoverValue(star);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverValue(0);
        }
    };

    return (
        <div className="flex items-center gap-1">
            <div
                className={cn("flex", !readonly && "cursor-pointer")}
                onMouseLeave={handleMouseLeave}
            >
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= displayValue;
                    const isHalf = !isFilled && star - 0.5 <= displayValue;

                    return (
                        <button
                            key={star}
                            type="button"
                            onClick={() => handleClick(star)}
                            onMouseEnter={() => handleMouseEnter(star)}
                            disabled={readonly}
                            className={cn(
                                "transition-all duration-150",
                                !readonly && "hover:scale-110",
                                readonly && "cursor-default"
                            )}
                        >
                            <Star
                                className={cn(
                                    sizeClasses[size],
                                    "transition-colors",
                                    isFilled
                                        ? "fill-yellow-400 text-yellow-400"
                                        : isHalf
                                            ? "fill-yellow-400/50 text-yellow-400"
                                            : "text-gray-400/40"
                                )}
                            />
                        </button>
                    );
                })}
            </div>
            {showValue && (
                <span className="ml-2 text-sm text-muted-foreground">
                    {value > 0 ? value.toFixed(1) : "No ratings"}
                </span>
            )}
        </div>
    );
}
