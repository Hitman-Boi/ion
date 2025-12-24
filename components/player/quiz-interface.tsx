"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { submitQuiz } from "@/app/actions/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Question {
    id: string;
    text: string;
    options: { id: string; text: string }[];
    correctOptionId: string;
}

interface QuizInterfaceProps {
    topicId: string;
    questions: Question[];
    onComplete?: () => void;
}

export function QuizInterface({ topicId, questions, onComplete }: QuizInterfaceProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const router = useRouter();
    const posthog = usePostHog();

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    const handleOptionSelect = (value: string) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: value,
        }));
    };

    const handleNext = () => {
        if (isLastQuestion) {
            handleSubmit();
        } else {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        let correctCount = 0;

        questions.forEach((q) => {
            if (answers[q.id] === q.correctOptionId) {
                correctCount++;
            }
        });

        const calculatedScore = Math.round((correctCount / questions.length) * 100);
        setScore(calculatedScore);

        // Track attempt
        if (calculatedScore < 70) {
            posthog.capture(AnalyticsEvents.QUIZ_FAILED, {
                topic_id: topicId,
                score: calculatedScore
            });
        }

        try {
            await submitQuiz(topicId, calculatedScore);
            toast.success(`Quiz completed! Score: ${calculatedScore}%`);
            if (onComplete) onComplete();
            router.refresh();
        } catch (error) {
            console.error("Failed to submit quiz:", error);
            toast.error("Failed to submit quiz results");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (score !== null) {
        return (
            <Card className="w-full max-w-2xl mx-auto mt-8">
                <CardHeader>
                    <CardTitle>Quiz Results</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <div className="text-5xl font-bold mb-4">{score}%</div>
                        <p className="text-muted-foreground">
                            {score >= 70 ? "Congratulations! You passed." : "Keep studying and try again."}
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button onClick={() => {
                        setScore(null);
                        setAnswers({});
                        setCurrentQuestionIndex(0);
                    }}>Retry Quiz</Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-2xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>
                    Question {currentQuestionIndex + 1} of {questions.length}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-lg font-medium mb-4">{currentQuestion.text}</div>
                <RadioGroup
                    value={answers[currentQuestion.id]}
                    onValueChange={handleOptionSelect}
                    className="space-y-3"
                >
                    {currentQuestion.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                            <RadioGroupItem value={option.id} id={option.id} />
                            <Label htmlFor={option.id} className="flex-grow cursor-pointer">{option.text}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
            <CardFooter className="justify-between">
                <Button
                    variant="ghost"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                >
                    Previous
                </Button>
                <Button onClick={handleNext} disabled={!answers[currentQuestion.id] || isSubmitting}>
                    {isSubmitting ? "Submitting..." : isLastQuestion ? "Submit" : "Next"}
                </Button>
            </CardFooter>
        </Card>
    );
}
