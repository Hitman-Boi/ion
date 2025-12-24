/**
 * Content Flag Constants
 * Shared between server actions and client components
 */

// Valid flag reasons for content issues
export const FLAG_REASONS = [
    "Video Won't Load",
    "Audio is Bad",
    "Content is Outdated",
    "Typo or Error",
    "Other",
] as const;

export type FlagReason = (typeof FLAG_REASONS)[number];
