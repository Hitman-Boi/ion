"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, X, Sparkles } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StarRating } from "@/components/ui/star-rating";
import { submitCourseReview } from "@/app/actions/course-review.actions";

interface CourseCompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    courseTitle: string;
    onCertificateClick?: () => void;
}

export function CourseCompletionModal({
    isOpen,
    onClose,
    courseId,
    courseTitle,
    onCertificateClick,
}: CourseCompletionModalProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmitReview = async () => {
        if (rating === 0) {
            setError("Please select a rating");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await submitCourseReview(
                courseId,
                rating,
                comment || undefined,
                isPublic
            );
            setHasSubmitted(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGetCertificate = () => {
        onCertificateClick?.();
        onClose();
    };

    const handleSkip = () => {
        if (hasSubmitted || rating === 0) {
            onClose();
        } else {
            // If they have a rating but haven't submitted, skip means close without review
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-gradient-to-b from-background to-background/95 border-primary/20">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 relative">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.6 }}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center"
                        >
                            <Award className="w-10 h-10 text-white" />
                        </motion.div>
                        {/* Sparkle effects */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="absolute -top-2 -right-2"
                        >
                            <Sparkles className="w-6 h-6 text-yellow-400" />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="absolute -bottom-1 -left-2"
                        >
                            <Sparkles className="w-4 h-4 text-amber-400" />
                        </motion.div>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                            🎉 Course Completed!
                        </DialogTitle>
                        <DialogDescription className="text-base mt-2">
                            You&apos;ve completed <span className="font-semibold">{courseTitle}</span>
                        </DialogDescription>
                    </motion.div>
                </DialogHeader>

                <AnimatePresence mode="wait">
                    {!hasSubmitted ? (
                        <motion.div
                            key="rating-form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6 py-4"
                        >
                            {/* Rating Section */}
                            <div className="text-center space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    How would you rate this course?
                                </p>
                                <div className="flex justify-center">
                                    <StarRating value={rating} onChange={setRating} size="lg" />
                                </div>
                                {rating > 0 && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-sm text-muted-foreground"
                                    >
                                        {rating === 5
                                            ? "Excellent! ⭐"
                                            : rating === 4
                                                ? "Great! 👍"
                                                : rating === 3
                                                    ? "Good 😊"
                                                    : rating === 2
                                                        ? "Could be better 🤔"
                                                        : "Needs improvement 💭"}
                                    </motion.p>
                                )}
                            </div>

                            {/* Comment Section */}
                            <div className="space-y-2">
                                <Label htmlFor="comment" className="text-sm">
                                    Share your thoughts (optional)
                                </Label>
                                <Textarea
                                    id="comment"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="What did you like? What could be improved?"
                                    className="resize-none"
                                    rows={3}
                                />
                            </div>

                            {/* Public Toggle */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="public" className="text-sm">
                                        Make review public
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Your name will be shown with your review
                                    </p>
                                </div>
                                <Switch
                                    id="public"
                                    checked={isPublic}
                                    onCheckedChange={setIsPublic}
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-destructive text-center">{error}</p>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={handleSubmitReview}
                                    disabled={rating === 0 || isSubmitting}
                                    className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black font-semibold"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Review & Get Certificate"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={handleSkip}
                                    className="text-muted-foreground"
                                >
                                    Skip for now
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-4 py-4"
                        >
                            <p className="text-lg">Thank you for your feedback! 🙏</p>
                            <Button
                                onClick={handleGetCertificate}
                                className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold"
                            >
                                <Award className="w-4 h-4 mr-2" />
                                Get Your Certificate
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
