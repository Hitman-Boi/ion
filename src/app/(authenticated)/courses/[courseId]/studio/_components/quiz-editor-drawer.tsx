'use client'

import { updateTopicResource } from '@/app/actions/course-editor.actions'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HelpCircle, Loader2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface QuizQuestion {
    q: string
    options: string[]
    answer: string
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

    const addQuestion = () => {
        setQuestions([...questions, { q: '', options: ['', ''], answer: '' }])
    }

    const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
        const updated = [...questions]
        updated[index] = { ...updated[index], [field]: value }
        setQuestions(updated)
    }

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const updated = [...questions]
        updated[qIndex].options[oIndex] = value
        setQuestions(updated)
    }

    const addOption = (qIndex: number) => {
        const updated = [...questions]
        updated[qIndex].options.push('')
        setQuestions(updated)
    }

    const removeOption = (qIndex: number, oIndex: number) => {
        const updated = [...questions]
        updated[qIndex].options.splice(oIndex, 1)
        setQuestions(updated)
    }

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index))
    }

    const handleSave = async () => {
        if (!resource) return
        setLoading(true)
        try {
            const quizData = { questions }
            await updateTopicResource(resource.id, { quizData }, courseId)
            onResourceUpdate({ ...resource, quizData })
            toast.success('Quiz saved')
            onOpenChange(false)
        } catch (e) {
            toast.error('Save failed')
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
                        Create questions with multiple choice answers.
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
                        <div key={qIndex} className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg space-y-3">
                            <div className="flex items-start gap-2">
                                <span className="text-green-400 font-medium text-sm mt-2">Q{qIndex + 1}</span>
                                <div className="flex-1 space-y-2">
                                    <Input
                                        value={question.q}
                                        onChange={(e) => updateQuestion(qIndex, 'q', e.target.value)}
                                        placeholder="Enter question..."
                                        className="bg-white/5 border-white/10"
                                    />
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="text-red-400 hover:bg-red-500/10 h-8 w-8"
                                    onClick={() => removeQuestion(qIndex)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="pl-8 space-y-2">
                                <Label className="text-xs text-gray-400">Options (click to set as answer)</Label>
                                {question.options.map((option, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => updateQuestion(qIndex, 'answer', option)}
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${question.answer === option
                                                    ? 'border-green-400 bg-green-400'
                                                    : 'border-gray-500 hover:border-gray-400'
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
                                        {question.options.length > 2 && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-red-400 hover:bg-red-500/10 h-6 w-6"
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
                                    className="text-gray-400 text-xs h-7"
                                    onClick={() => addOption(qIndex)}
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Add Option
                                </Button>
                            </div>
                        </div>
                    ))}

                    <Button
                        variant="outline"
                        className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
                        onClick={addQuestion}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Question
                    </Button>
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
