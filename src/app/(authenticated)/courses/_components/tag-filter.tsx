"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Hardcoded popular tags or fetched? Ideally fetched, but for now I can accept a list of tags as props 
// or I can fetch them in the parent and pass them down.
// Let's assume the page will fetch all skills to show as filter options.
// Or I can just show the selected tag and maybe some common ones. 
// For this task, I'll assume we pass available tags as props.

interface TagFilterProps {
    items: { id: string; name: string }[];
}

export const TagFilter = ({ items }: TagFilterProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentTag = searchParams.get("tag");

    const onClick = (tagName: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (currentTag === tagName) {
            params.delete("tag");
        } else {
            params.set("tag", tagName);
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex gap-2 overflow-x-auto pb-2 noscrollbar">
            {items.map((item) => {
                const isSelected = currentTag === item.name;
                return (
                    <button
                        key={item.id}
                        onClick={() => onClick(item.name)}
                        className={cn(
                            "py-1.5 px-3 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
                            isSelected
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "bg-black/20 border-white/10 text-muted-foreground hover:bg-black/40 hover:text-white"
                        )}
                    >
                        {item.name}
                    </button>
                )
            })}
        </div>
    );
};
