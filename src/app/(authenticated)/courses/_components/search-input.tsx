"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
// Assuming useDebounce exists or I might need to implement/use setTimeout. 
// I'll stick to a simple useEffect with timeout for now to be safe, or check if the hook exists. 
// Safest is to implement debounce internally in this component to avoid missing dependency errors.

export const SearchInput = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentTerm = searchParams.get("term") || "";
    const [value, setValue] = useState(currentTerm);
    const [debouncedValue, setDebouncedValue] = useState(value);

    // Debounce logic
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [value]);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (debouncedValue && debouncedValue.length > 0) {
            params.set("term", debouncedValue);
        } else {
            params.delete("term");
        }

        const newUrl = `${pathname}?${params.toString()}`;
        router.push(newUrl);
    }, [debouncedValue, router, pathname, searchParams]);

    return (
        <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                onChange={(e) => setValue(e.target.value)}
                value={value}
                className="w-full pl-9 bg-black/20 border-white/10 focus-visible:ring-indigo-500"
                placeholder="Search courses..."
            />
        </div>
    );
};
