'use client'

import { updateTopicResource } from '@/app/actions/course-editor.actions'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpCircle, Loader2, Plus, Trash2, AlignJustify, Type, Hash, CheckSquare } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export type QuestionType = 'multiple-choice' | 'text' | 'number' | 'boolean'

interface QuizQuestion {
    type?: QuestionType
    q: string
    options?: string[]
    answer: string | number | boolean
}

interface QuizEditorDrawerProps {
    courseId: string
    resource: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onResourceUpdate: (updatedResource: any) => void
}

export function QuizEditorDrawer({ courseId, resource, open, onOpenChange, onResourceUpdate }: QuizEditorDrawerProps) {
    const [loading, setLoading] = useState(false)

    const initialQuestions = resource?.quizData?.questions || []
    const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions)

    const addQuestion = (type: QuestionType) => {
        let newQuestion: QuizQuestion = { type, q: '', answer: '' }

        if (type === 'multiple-choice') {
            newQuestion.options = ['', '']
            newQuestion.answer = ''
        } else if (type === 'boolean') {
            newQuestion.answer = 'true'
        } else if (type === 'number') {
            newQuestion.answer = ''
        }

        setQuestions([...questions, newQuestion])
    }

    const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
        const updated = [...questions]
        // @ts-ignore
        updated[index] = { ...updated[index], [field]: value }

        // Reset specific fields when type changes
        if (field === 'type') {
            if (value === 'multiple-choice') {
                updated[index].options = ['', '']
                updated[index].answer = ''
            } else if (value === 'boolean') {
                updated[index].options = undefined
                updated[index].answer = 'true'
            } else {
                updated[index].options = undefined
                updated[index].answer = ''
            }
        }

        setQuestions(updated)
    }

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const updated = [...questions]
        if (updated[qIndex].options) {
            updated[qIndex].options![oIndex] = value
            setQuestions(updated)
        }
    }

    const addOption = (qIndex: number) => {
        const updated = [...questions]
        if (updated[qIndex].options) {
            updated[qIndex].options!.push('')
            setQuestions(updated)
        }
    }

    const removeOption = (qIndex: number, oIndex: number) => {
        const updated = [...questions]
        if (updated[qIndex].options) {
            updated[qIndex].options!.splice(oIndex, 1)
            setQuestions(updated)
        }
    }

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index))
    }

    const handleSave = async () => {
        if (!resource) return

        setLoading(true)
        try {
            const quizData = { questions }
            const summary = `Quiz: ${questions.length} Questions`
            await updateTopicResource(resource.id, { quizData, summary }, courseId)
            onResourceUpdate({ ...resource, quizData, summary })
            toast.success('Quiz saved')
            onOpenChange(false)
        } catch (e: any) {
            toast.error(e.message || 'Save failed')
        } finally {
            setLoading(false)
        }
    }

    if (!resource) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col bg-[#0f1115] border-white/10 text-white overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="text-white flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-green-400" />
                        Edit Quiz
                    </SheetTitle>
                    <SheetDescription className="text-gray-400">
                        Create questions with multiple choice, text, number, or boolean answers.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 space-y-4 mt-6 overflow-y-auto">
                    {questions.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No questions yet. Add one below.</p>
                        </div>
                    )}

                    {questions.map((question, qIndex) => (
                        <div key={qIndex} className="p-4 bg-white/[0.02] border border-white/5 rounded-lg">
                            <div className="flex items-start gap-4">
                                <span className="text-white/40 font-mono text-sm pt-3 whitespace-nowrap w-6">Q{qIndex + 1}</span>
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="text-white/40">
                                            {question.type === 'multiple-choice' && <AlignJustify className="w-4 h-4" />}
                                            {question.type === 'text' && <Type className="w-4 h-4" />}
                                            {question.type === 'number' && <Hash className="w-4 h-4" />}
                                            {question.type === 'boolean' && <CheckSquare className="w-4 h-4" />}
                                        </div>
                                        <Input
                                            value={question.q}
                                            onChange={(e) => updateQuestion(qIndex, 'q', e.target.value)}
                                            placeholder="Enter question..."
                                            className="bg-transparent border-none text-base px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/20"
                                        />
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-white/20 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 -mr-1"
                                            onClick={() => removeQuestion(qIndex)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="h-px bg-white/10 w-full" />

                                    {/* Subjective/Text Expectation UI - Moved inside input flow or kept simple */}
                                    {/* We keep the specific answer fields below the header */}

                                    {/* Multiple Choice UI */}
                                    {(question.type === 'multiple-choice' || !question.type) && (
                                        <div className="pl-0 space-y-2 mt-2">
                                            <Label className="text-xs text-gray-400">Options (click to set as answer)</Label>
                                            {question.options?.map((option, oIndex) => (
                                                <div key={oIndex} className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuestion(qIndex, 'answer', option)}
                                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${question.answer === option
                                                            ? 'border-green-400 bg-green-400'
                                                            : 'border-white/20 hover:border-white/40'
                                                            }`}
                                                    >
                                                        {question.answer === option && (
                                                            <div className="w-2 h-2 rounded-full bg-white" />
                                                        )}
                                                    </button>
                                                    <Input
                                                        value={option}
                                                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                        placeholder={`Option ${oIndex + 1}`}
                                                        className="bg-white/5 border-white/10 flex-1 h-8 text-sm"
                                                    />
                                                    {question.options!.length > 2 && (
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-white/40 hover:bg-white/10 h-6 w-6"
                                                            onClick={() => removeOption(qIndex, oIndex)}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-white/40 text-xs h-7 hover:text-white"
                                                onClick={() => addOption(qIndex)}
                                            >
                                                <Plus className="w-3 h-3 mr-1" /> Add Option
                                            </Button>
                                        </div>
                                    )}

                                    {/* Text (Subjective) UI */}
                                    {question.type === 'text' && (
                                        <div className="space-y-2 mt-2">
                                            <Label className="text-xs text-gray-400">Short Answer Expectation (Optional)</Label>
                                            <Input
                                                value={question.answer as string}
                                                onChange={(e) => updateQuestion(qIndex, 'answer', e.target.value)}
                                                placeholder="Enter expected answer keywords..."
                                                className="bg-white/5 border-white/10"
                                            />
                                        </div>
                                    )}

                                    {/* Number UI */}
                                    {question.type === 'number' && (
                                        <div className="space-y-2 mt-2">
                                            <Label className="text-xs text-gray-400">Correct Number Answer</Label>
                                            <Input
                                                type="number"
                                                value={question.answer as string}
                                                onChange={(e) => updateQuestion(qIndex, 'answer', e.target.value)}
                                                placeholder="Enter correct number..."
                                                className="bg-white/5 border-white/10 w-48"
                                            />
                                        </div>
                                    )}

                                    {/* Boolean UI */}
                                    {question.type === 'boolean' && (
                                        <div className="space-y-2 mt-2">
                                            <Label className="text-xs text-gray-400">Correct Answer</Label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={String(question.answer) === 'true'}
                                                        onChange={() => updateQuestion(qIndex, 'answer', 'true')}
                                                        className="text-green-500 focus:ring-green-500 bg-white/10 border-white/20"
                                                    />
                                                    <span className="text-sm">True</span>
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        checked={String(question.answer) === 'false'}
                                                        onChange={() => updateQuestion(qIndex, 'answer', 'false')}
                                                        className="text-green-500 focus:ring-green-500 bg-white/10 border-white/20"
                                                    />
                                                    <span className="text-sm">False</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="outline"
                            className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white justify-start"
                            onClick={() => addQuestion('multiple-choice')}
                        >
                            <AlignJustify className="w-4 h-4 mr-2 opacity-50" /> Multiple Choice
                        </Button>
                        <Button
                            variant="outline"
                            className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white justify-start"
                            onClick={() => addQuestion('text')}
                        >
                            <Type className="w-4 h-4 mr-2 opacity-50" /> Short Answer
                        </Button>
                        <Button
                            variant="outline"
                            className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white justify-start"
                            onClick={() => addQuestion('number')}
                        >
                            <Hash className="w-4 h-4 mr-2 opacity-50" /> Number
                        </Button>
                        <Button
                            variant="outline"
                            className="border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white justify-start"
                            onClick={() => addQuestion('boolean')}
                        >
                            <CheckSquare className="w-4 h-4 mr-2 opacity-50" /> True / False
                        </Button>
                    </div>
                </div>

                <div className="pt-4 mt-auto border-t border-white/10">
                    <Button onClick={handleSave} disabled={loading} className="w-full">
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Quiz
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
