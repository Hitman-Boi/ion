import { NextRequest, NextResponse } from "next/server";
import {
    updateAllCompletionRates,
    recalculateAllHealthScores,
    deprecateRottingCourses,
} from "@/app/actions/health-score.actions";

/**
 * Nightly cron job endpoint for content health maintenance
 * 
 * This endpoint performs:
 * 1. Update all course completion rates
 * 2. Recalculate all health scores (freshness decay)
 * 3. Auto-deprecate rotting courses (+60 days past TTL)
 * 
 * Security: Protected by CRON_SECRET environment variable
 * 
 * Trigger via:
 * - Vercel Cron: Add "crons" to vercel.json
 * - External: curl -X POST http://localhost:3000/api/cron/update-health-scores -H "Authorization: Bearer $CRON_SECRET"
 */
export async function POST(request: NextRequest) {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        console.error("CRON_SECRET not configured");
        return NextResponse.json(
            { error: "Cron endpoint not configured" },
            { status: 500 }
        );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();
    const results: Record<string, unknown> = {};

    try {
        // Step 1: Update completion rates
        console.log("[Cron] Starting completion rate updates...");
        const completionResult = await updateAllCompletionRates();
        results.completionRates = completionResult;
        console.log(
            `[Cron] Completion rates updated: ${completionResult.updated} courses`
        );

        // Step 2: Recalculate health scores
        console.log("[Cron] Starting health score recalculation...");
        const healthResult = await recalculateAllHealthScores();
        results.healthScores = healthResult;
        console.log(
            `[Cron] Health scores updated: ${healthResult.updated} courses`
        );

        // Step 3: Auto-deprecate rotting courses
        console.log("[Cron] Checking for rotting courses...");
        const deprecateResult = await deprecateRottingCourses();
        results.deprecated = deprecateResult;
        if (deprecateResult.deprecated > 0) {
            console.log(
                `[Cron] Deprecated ${deprecateResult.deprecated} rotting courses`
            );
        }

        const duration = Date.now() - startTime;
        results.duration = `${duration}ms`;

        return NextResponse.json({
            success: true,
            message: "Content health update completed",
            results,
        });
    } catch (error) {
        console.error("[Cron] Error during content health update:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                partialResults: results,
            },
            { status: 500 }
        );
    }
}

// Also support GET for Vercel Cron (which uses GET by default)
export async function GET(request: NextRequest) {
    return POST(request);
}
