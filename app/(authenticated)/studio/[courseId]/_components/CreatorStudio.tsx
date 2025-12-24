'use client'

import { createChapter, createTopic, deleteChapter, deleteTopic, reorderChapters, reorderTopics } from '@/app/actions/course-editor.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Sheet,
    SheetContent,
    SheetDescription, SheetFooter, SheetHeader,
    SheetTitle
} from "@/components/ui/sheet"
import { closestCenter, DndContext, DragEndEvent, DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Eye, FileText, GripVertical, HelpCircle, Plus, Trash2, Video } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { TopicEditorDrawer } from './TopicEditorDrawer'
import { CourseSkillsManager } from '@/components/course/course-skills-manager'

// --- SORTABLE CHAPTER ---
function SortableChapter({ id, children }: { id: string, children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { type: 'chapter' } })
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

    return (
        <div ref={setNodeRef} style={style} className="mb-4">
            <div className="flex items-start gap-2">
                <div {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-white mt-4">
                    <GripVertical className="w-5 h-5" />
                </div>
                {children}
            </div>
        </div>
    )
}

// --- SORTABLE TOPIC ---
function SortableTopic({ id, topic, courseId, onEdit, onDelete }: { id: string, topic: any, courseId: string, onEdit: () => void, onDelete: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { type: 'topic', chapterId: topic.chapterId } })
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg hover:bg-black/40 transition-colors border border-transparent hover:border-white/5">
            <div {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-white">
                <GripVertical className="w-4 h-4" />
            </div>
            <div className="flex-1 cursor-pointer" onClick={onEdit}>
                <h3 className="font-medium text-sm text-gray-200">{topic.title}</h3>
                <div className="flex gap-2 mt-1">
                    {topic.resources?.filter((r: any) => r.type === 'VIDEO').length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-blue-400">
                            <Video className="w-3 h-3" /> {topic.resources.filter((r: any) => r.type === 'VIDEO').length}
                        </span>
                    )}
                    {topic.resources?.filter((r: any) => r.type === 'PDF').length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-purple-400">
                            <FileText className="w-3 h-3" /> {topic.resources.filter((r: any) => r.type === 'PDF').length}
                        </span>
                    )}
                    {topic.resources?.filter((r: any) => r.type === 'QUIZ').length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-green-400">
                            <HelpCircle className="w-3 h-3" /> {topic.resources.filter((r: any) => r.type === 'QUIZ').length}
                        </span>
                    )}
                </div>
            </div>
            <a
                href={`/courses/${courseId}/learn/${topic.id}?preview=true`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className='inline-flex items-center justify-center p-0 w-6 h-6 rounded-md hover:bg-white/10 text-blue-400 mr-1'
                title="Preview as Student"
            >
                <Eye className="w-3 h-3" />
            </a>
            <Button size="icon" variant="ghost" className="text-red-400 h-6 w-6" onClick={(e) => { e.stopPropagation(); onDelete() }}>
                <Trash2 className="w-3 h-3" />
            </Button>
        </div>
    )
}

// --- INPUT SHEET STATE ---
type SheetMode = 'chapter' | 'topic' | 'delete-chapter' | 'delete-topic' | null

interface InputSheetState {
    mode: SheetMode
    title: string
    targetChapterId?: string
    targetTopicId?: string
}

// --- MAIN COMPONENT ---
export function CreatorStudio({ course, allSkills }: { course: any, allSkills: any[] }) {
    const [chapters, setChapters] = useState(course.chapters)
    const [editingTopic, setEditingTopic] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [sheetState, setSheetState] = useState<InputSheetState>({ mode: null, title: '' })
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeType, setActiveType] = useState<'chapter' | 'topic' | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    // Get all topic IDs for SortableContext
    const allTopicIds = chapters.flatMap((c: any) => c.topics.map((t: any) => t.id))

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        setActiveId(active.id as string)
        setActiveType(active.data.current?.type || null)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)
        setActiveType(null)

        if (!over || active.id === over.id) return

        const activeData = active.data.current
        const overData = over.data.current

        // Chapter reordering
        if (activeData?.type === 'chapter' && overData?.type === 'chapter') {
            const oldIndex = chapters.findIndex((c: any) => c.id === active.id)
            const newIndex = chapters.findIndex((c: any) => c.id === over.id)
            const newChapters = arrayMove(chapters, oldIndex, newIndex)
            setChapters(newChapters)
            await reorderChapters(course.id, newChapters.map((c: any, i) => ({ id: c.id, sortOrder: i })))
            return
        }

        // Topic reordering within same chapter
        if (activeData?.type === 'topic') {
            const activeChapterId = activeData.chapterId
            let overChapterId = overData?.chapterId || activeChapterId

            // Find which chapter the topic was dropped into
            const overChapter = chapters.find((c: any) => c.topics.some((t: any) => t.id === over.id))
            if (overChapter) overChapterId = overChapter.id

            // Get topics from active and over chapters
            const activeChapter = chapters.find((c: any) => c.id === activeChapterId)
            const targetChapter = chapters.find((c: any) => c.id === overChapterId)

            if (!activeChapter || !targetChapter) return

            const activeTopic = activeChapter.topics.find((t: any) => t.id === active.id)
            if (!activeTopic) return

            // Same chapter reorder
            if (activeChapterId === overChapterId) {
                const oldIndex = targetChapter.topics.findIndex((t: any) => t.id === active.id)
                const newIndex = targetChapter.topics.findIndex((t: any) => t.id === over.id)
                const reorderedTopics = arrayMove(targetChapter.topics, oldIndex, newIndex)

                setChapters(chapters.map((c: any) =>
                    c.id === activeChapterId ? { ...c, topics: reorderedTopics } : c
                ))

                await reorderTopics(
                    reorderedTopics.map((t: any, i) => ({ id: t.id, sortOrder: i, chapterId: activeChapterId })),
                    course.id
                )
            } else {
                // Move topic to different chapter
                const newActiveTopics = activeChapter.topics.filter((t: any) => t.id !== active.id)
                const overIndex = targetChapter.topics.findIndex((t: any) => t.id === over.id)
                const newTargetTopics = [...targetChapter.topics]
                newTargetTopics.splice(overIndex >= 0 ? overIndex : newTargetTopics.length, 0, { ...activeTopic, chapterId: overChapterId })

                setChapters(chapters.map((c: any) => {
                    if (c.id === activeChapterId) return { ...c, topics: newActiveTopics }
                    if (c.id === overChapterId) return { ...c, topics: newTargetTopics }
                    return c
                }))

                // Update both chapters
                const updates = [
                    ...newActiveTopics.map((t: any, i: number) => ({ id: t.id, sortOrder: i, chapterId: activeChapterId })),
                    ...newTargetTopics.map((t: any, i: number) => ({ id: t.id, sortOrder: i, chapterId: overChapterId }))
                ]
                await reorderTopics(updates, course.id)
            }
        }
    }

    const openAddChapterSheet = () => setSheetState({ mode: 'chapter', title: '' })
    const openAddTopicSheet = (chapterId: string) => setSheetState({ mode: 'topic', title: '', targetChapterId: chapterId })
    const openDeleteChapterSheet = (chapterId: string) => setSheetState({ mode: 'delete-chapter', title: '', targetChapterId: chapterId })
    const openDeleteTopicSheet = (topicId: string) => setSheetState({ mode: 'delete-topic', title: '', targetTopicId: topicId })
    const closeSheet = () => setSheetState({ mode: null, title: '' })

    const handleSheetSubmit = async () => {
        setIsLoading(true)
        try {
            if (sheetState.mode === 'chapter' && sheetState.title.trim()) {
                const newChapter = await createChapter(course.id, sheetState.title.trim())
                setChapters([...chapters, { ...newChapter, topics: [] }])
                toast.success('Chapter created')
                closeSheet()
            } else if (sheetState.mode === 'topic' && sheetState.title.trim() && sheetState.targetChapterId) {
                const newTopic = await createTopic(sheetState.targetChapterId, sheetState.title.trim(), course.id)
                setChapters(chapters.map((c: any) =>
                    c.id === sheetState.targetChapterId
                        ? { ...c, topics: [...c.topics, { ...newTopic, resources: [], chapterId: c.id }] }
                        : c
                ))
                toast.success('Topic created')
                closeSheet()
            } else if (sheetState.mode === 'delete-chapter' && sheetState.targetChapterId) {
                await deleteChapter(sheetState.targetChapterId, course.id)
                setChapters(chapters.filter((c: any) => c.id !== sheetState.targetChapterId))
                toast.success('Chapter deleted')
                closeSheet()
            } else if (sheetState.mode === 'delete-topic' && sheetState.targetTopicId) {
                await deleteTopic(sheetState.targetTopicId, course.id)
                setChapters(chapters.map((c: any) => ({
                    ...c,
                    topics: c.topics.filter((t: any) => t.id !== sheetState.targetTopicId)
                })))
                toast.success('Topic deleted')
                closeSheet()
            }
        } catch (error) {
            console.error("Action failed:", error)
            toast.error('Action failed')
        } finally {
            setIsLoading(false)
        }
    }

    const getSheetTitle = () => {
        switch (sheetState.mode) {
            case 'chapter': return 'Add New Chapter'
            case 'topic': return 'Add New Topic'
            case 'delete-chapter': return 'Delete Chapter'
            case 'delete-topic': return 'Delete Topic'
            default: return ''
        }
    }

    const getSheetDescription = () => {
        switch (sheetState.mode) {
            case 'chapter': return 'Enter a title for the new chapter.'
            case 'topic': return 'Enter a title for the new topic.'
            case 'delete-chapter': return 'Are you sure? This will delete all topics in this chapter.'
            case 'delete-topic': return 'Are you sure? This will delete all resources in this topic.'
            default: return ''
        }
    }

    const isDeleteMode = sheetState.mode === 'delete-chapter' || sheetState.mode === 'delete-topic'

    // Callback to refresh topic resources after edit
    const handleTopicUpdate = (topicId: string, newResources: any[]) => {
        setChapters(chapters.map((c: any) => ({
            ...c,
            topics: c.topics.map((t: any) => t.id === topicId ? { ...t, resources: newResources } : t)
        })))
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <header className="flex justify-between items-center border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{course.title}</h1>
                    <p className="text-gray-400">Drag chapters or topics to reorder. Click topics to add content.</p>
                </div>
                <div className="flex gap-2">
                    <CourseSkillsManager
                        courseId={course.id}
                        initialStatus={course.skills.map((s: any) => s.id)}
                        allSkills={allSkills}
                    />
                    <Button onClick={openAddChapterSheet} className="bg-white text-black hover:bg-gray-200">
                        <Plus className="w-4 h-4 mr-2" /> New Chapter
                    </Button>
                </div>
            </header>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={chapters.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                        {chapters.map((chapter: any) => (
                            <SortableChapter key={chapter.id} id={chapter.id}>
                                <div className="flex-1 bg-[#16181d] border border-white/5 rounded-xl overflow-hidden group">
                                    <div className="p-4 bg-white/5 flex justify-between items-center border-b border-white/5">
                                        <h2 className="font-semibold text-lg">{chapter.title}</h2>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="sm" variant="ghost" onClick={() => openAddTopicSheet(chapter.id)}>
                                                <Plus className="w-4 h-4 mr-1" /> Add Topic
                                            </Button>
                                            <Button size="icon" variant="ghost" className="text-red-400" onClick={() => openDeleteChapterSheet(chapter.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-2">
                                        {chapter.topics.length === 0 && (
                                            <div className="text-sm text-gray-600 italic py-4 text-center">No topics yet. Add one above.</div>
                                        )}
                                        <SortableContext items={chapter.topics.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
                                            {chapter.topics.map((topic: any) => (
                                                <SortableTopic
                                                    key={topic.id}
                                                    id={topic.id}
                                                    topic={{ ...topic, chapterId: chapter.id }}
                                                    courseId={course.id}
                                                    onEdit={() => setEditingTopic({ ...topic, chapterId: chapter.id })}
                                                    onDelete={() => openDeleteTopicSheet(topic.id)}
                                                />
                                            ))}
                                        </SortableContext>
                                    </div>
                                </div>
                            </SortableChapter>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {editingTopic && (
                <TopicEditorDrawer
                    courseId={course.id}
                    topicId={editingTopic.id}
                    open={!!editingTopic}
                    onOpenChange={(open) => !open && setEditingTopic(null)}
                    initialResources={editingTopic.resources || []}
                    onResourcesChange={(newResources) => handleTopicUpdate(editingTopic.id, newResources)}
                />
            )}

            <Sheet open={sheetState.mode !== null} onOpenChange={(open) => !open && closeSheet()}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{getSheetTitle()}</SheetTitle>
                        <SheetDescription>{getSheetDescription()}</SheetDescription>
                    </SheetHeader>

                    {!isDeleteMode && (
                        <div className="py-6">
                            <Input
                                autoFocus
                                placeholder={sheetState.mode === 'chapter' ? 'e.g. Getting Started' : 'e.g. Introduction Video'}
                                value={sheetState.title}
                                onChange={(e) => setSheetState({ ...sheetState, title: e.target.value })}
                                onKeyDown={(e) => { if (e.key === 'Enter' && sheetState.title.trim()) handleSheetSubmit() }}
                            />
                        </div>
                    )}

                    <SheetFooter className="mt-4">
                        <Button variant="outline" onClick={closeSheet} disabled={isLoading}>Cancel</Button>
                        <Button
                            onClick={handleSheetSubmit}
                            disabled={isLoading || (!isDeleteMode && !sheetState.title.trim())}
                            variant={isDeleteMode ? "destructive" : "default"}
                        >
                            {isLoading ? 'Processing...' : isDeleteMode ? 'Delete' : 'Create'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    )
}
