"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { submitQuiz } from "@/app/actions/progress.actions";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Send, RotateCcw, Trophy, XCircle, Type, Hash, ToggleLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// Raw question format from quiz editor
interface RawQuestion {
    id?: string;
    q?: string;              // question text from editor
    text?: string;           // alternative field name
    type?: 'multiple-choice' | 'multiple_choice' | 'text' | 'number' | 'boolean' | 'true_false';
    options?: string[] | { id: string; text: string }[];
    answer?: string | number | boolean; // correct answer (option text for MC, or direct value)
    correctOptionId?: string;
    correctAnswer?: string;
}

// Normalized question format for internal use
interface NormalizedQuestion {
    id: string;
    text: string;
    type: 'multiple_choice' | 'text' | 'number' | 'true_false';
    options: { id: string; text: string }[];
    correctAnswer: string; // always string for comparison
}

interface QuizInterfaceProps {
    topicId: string;
    questions: RawQuestion[];
    onComplete?: () => void;
}

// Helper to normalize a question from editor format
function normalizeQuestion(q: RawQuestion, index: number): NormalizedQuestion {
    const id = q.id || `q-${index}`;
    const text = q.q || q.text || 'Question';

    // Normalize type
    let type: NormalizedQuestion['type'] = 'multiple_choice';
    if (q.type === 'text') type = 'text';
    else if (q.type === 'number') type = 'number';
    else if (q.type === 'boolean' || q.type === 'true_false') type = 'true_false';
    else if (q.type === 'multiple-choice' || q.type === 'multiple_choice' || !q.type) type = 'multiple_choice';

    // Normalize options
    let options: { id: string; text: string }[] = [];
    if (Array.isArray(q.options)) {
        options = q.options.map((opt, i) => {
            if (typeof opt === 'string') {
                return { id: `opt-${i}`, text: opt };
            }
            return opt;
        });
    }

    // Normalize correct answer
    let correctAnswer = '';
    if (type === 'multiple_choice') {
        // For MC, answer is the option text - find matching option ID
        const answerText = String(q.answer || q.correctAnswer || '');
        const matchingOption = options.find(opt => opt.text === answerText);
        correctAnswer = matchingOption?.id || q.correctOptionId || '';
    } else {
        // For subjective, answer is direct
        correctAnswer = String(q.answer || q.correctAnswer || '');
    }

    return { id, text, type, options, correctAnswer };
}

export function QuizInterface({ topicId, questions: rawQuestions, onComplete }: QuizInterfaceProps) {
    // Normalize questions on mount
    const questions = useMemo(() =>
        rawQuestions.map((q, i) => normalizeQuestion(q, i)),
        [rawQuestions]
    );

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const router = useRouter();
    const posthog = usePostHog();

    // Handle empty questions
    if (!questions || questions.length === 0) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-12 text-center">
                <XCircle className="w-16 h-16 text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Questions Available</h3>
                <p className="text-gray-400">This quiz doesn&apos;t have any questions yet.</p>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const isFirstQuestion = currentQuestionIndex === 0;

    const handleAnswerChange = (value: string) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: value,
        }));
    };

    const handlePrevious = () => {
        if (!isFirstQuestion) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleNext = () => {
        if (!isLastQuestion) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        let correctCount = 0;

        questions.forEach((q) => {
            const userAnswer = answers[q.id]?.toLowerCase().trim();
            const correctAnswer = q.correctAnswer?.toLowerCase().trim();

            if (userAnswer === correctAnswer) {
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
            // Don't auto-navigate - let user click Continue button
            router.refresh();
        } catch (error) {
            console.error("Failed to submit quiz:", error);
            toast.error("Failed to submit quiz results");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetry = () => {
        setScore(null);
        setAnswers({});
        setCurrentQuestionIndex(0);
    };

    // Calculate progress
    const answeredCount = Object.keys(answers).length;
    const progressPercentage = (answeredCount / questions.length) * 100;

    // Check if current question is answered
    const isCurrentAnswered = !!answers[currentQuestion?.id];

    // Render results screen
    if (score !== null) {
        const passed = score >= 70;
        return (
            <div className="w-full flex flex-col items-center py-8">
                {/* Score Circle */}
                <div className={cn(
                    "w-32 h-32 rounded-full flex items-center justify-center mb-6 border-4",
                    passed
                        ? "bg-emerald-500/20 border-emerald-500/50"
                        : "bg-red-500/20 border-red-500/50"
                )}>
                    <div className="text-center">
                        <div className={cn(
                            "text-4xl font-bold",
                            passed ? "text-emerald-400" : "text-red-400"
                        )}>
                            {score}%
                        </div>
                    </div>
                </div>

                {/* Result Message */}
                <div className="flex items-center gap-2 mb-4">
                    {passed ? (
                        <Trophy className="w-6 h-6 text-yellow-400" />
                    ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                    )}
                    <h3 className="text-xl font-semibold text-white">
                        {passed ? "Congratulations!" : "Keep Learning"}
                    </h3>
                </div>
                <p className="text-gray-400 text-center mb-8 max-w-sm">
                    {passed
                        ? "You passed the quiz! Great job understanding this topic."
                        : "You need 70% to pass. Review the material and try again."}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                    {!passed && (
                        <Button
                            onClick={handleRetry}
                            variant="outline"
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                    )}
                    {passed && onComplete && (
                        <Button
                            onClick={onComplete}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Continue
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // Render question input based on type
    const renderQuestionInput = () => {
        const { type, options, id } = currentQuestion;
        const currentAnswer = answers[id] || '';

        switch (type) {
            case 'text':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                            <Type className="w-4 h-4" />
                            <span>Text Answer</span>
                        </div>
                        <Input
                            type="text"
                            placeholder="Type your answer here..."
                            value={currentAnswer}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 h-12"
                        />
                    </div>
                );

            case 'number':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                            <Hash className="w-4 h-4" />
                            <span>Numeric Answer</span>
                        </div>
                        <Input
                            type="number"
                            placeholder="Enter a number..."
                            value={currentAnswer}
                            onChange={(e) => handleAnswerChange(e.target.value)}
                            className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 h-12"
                        />
                    </div>
                );

            case 'true_false':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                            <ToggleLeft className="w-4 h-4" />
                            <span>True or False</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => handleAnswerChange('true')}
                                className={cn(
                                    "p-4 rounded-lg border transition-all duration-200",
                                    currentAnswer === 'true'
                                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                                )}
                            >
                                <span className="text-lg font-medium">True</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleAnswerChange('false')}
                                className={cn(
                                    "p-4 rounded-lg border transition-all duration-200",
                                    currentAnswer === 'false'
                                        ? "bg-red-500/20 border-red-500/50 text-red-400"
                                        : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                                )}
                            >
                                <span className="text-lg font-medium">False</span>
                            </button>
                        </div>
                    </div>
                );

            case 'multiple_choice':
            default:
                return (
                    <RadioGroup
                        value={currentAnswer}
                        onValueChange={handleAnswerChange}
                        className="space-y-3"
                    >
                        {options.map((option, index) => (
                            <div
                                key={option.id}
                                className={cn(
                                    "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200",
                                    currentAnswer === option.id
                                        ? "bg-blue-500/20 border-blue-500/50"
                                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                )}
                                onClick={() => handleAnswerChange(option.id)}
                            >
                                <RadioGroupItem
                                    value={option.id}
                                    id={option.id}
                                    className="border-white/30 text-blue-400"
                                />
                                <div className="flex items-center gap-3 flex-1">
                                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium text-gray-400">
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <Label
                                        htmlFor={option.id}
                                        className="flex-1 cursor-pointer text-gray-200"
                                    >
                                        {option.text}
                                    </Label>
                                </div>
                            </div>
                        ))}
                    </RadioGroup>
                );
        }
    };

    return (
        <div className="w-full flex flex-col">
            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <span className="text-sm text-gray-400">
                        {answeredCount} answered
                    </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className="flex-1 mb-6">
                {/* Question Text */}
                <h2 className="text-xl font-semibold text-white mb-6 leading-relaxed">
                    {currentQuestion.text}
                </h2>

                {/* Question Input */}
                {renderQuestionInput()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={isFirstQuestion}
                    className="text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                </Button>

                <div className="flex items-center gap-2">
                    {/* Question dots indicator */}
                    {questions.map((q, index) => (
                        <button
                            key={q.id}
                            type="button"
                            onClick={() => setCurrentQuestionIndex(index)}
                            className={cn(
                                "w-2.5 h-2.5 rounded-full transition-all duration-200",
                                index === currentQuestionIndex
                                    ? "bg-blue-500 scale-125"
                                    : answers[q.id]
                                        ? "bg-emerald-500"
                                        : "bg-white/20 hover:bg-white/40"
                            )}
                            title={`Question ${index + 1}`}
                        />
                    ))}
                </div>

                {isLastQuestion ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={!isCurrentAnswered || isSubmitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>Submitting...</>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-1" />
                                Submit
                            </>
                        )}
                    </Button>
                ) : (
                    <Button
                        onClick={handleNext}
                        disabled={!isCurrentAnswered}
                        className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                    >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                )}
            </div>
        </div>
    );
}
