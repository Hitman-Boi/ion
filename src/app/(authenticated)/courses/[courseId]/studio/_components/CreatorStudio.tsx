'use client'

import { createModule, createTopic, deleteModule, deleteTopic, reorderModules, reorderTopics } from '@/app/actions/course-editor.actions'
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

// --- SORTABLE MODULE ---
function SortableModule({ id, children }: { id: string, children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { type: 'module' } })
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
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { type: 'topic', moduleId: topic.moduleId } })
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
type SheetMode = 'module' | 'topic' | 'delete-module' | 'delete-topic' | null

interface InputSheetState {
    mode: SheetMode
    title: string
    targetModuleId?: string
    targetTopicId?: string
}

// --- MAIN COMPONENT ---
export function CreatorStudio({ course, allSkills }: { course: any, allSkills: any[] }) {
    const [modules, setModules] = useState(course.modules)
    const [editingTopic, setEditingTopic] = useState<any | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [sheetState, setSheetState] = useState<InputSheetState>({ mode: null, title: '' })
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeType, setActiveType] = useState<'module' | 'topic' | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    // Get all topic IDs for SortableContext
    const allTopicIds = modules.flatMap((c: any) => c.topics.map((t: any) => t.id))

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

        // Module reordering
        if (activeData?.type === 'module' && overData?.type === 'module') {
            const oldIndex = modules.findIndex((c: any) => c.id === active.id)
            const newIndex = modules.findIndex((c: any) => c.id === over.id)
            const newModules = arrayMove(modules, oldIndex, newIndex)
            setModules(newModules)
            await reorderModules(course.id, newModules.map((c: any, i) => ({ id: c.id, sortOrder: i })))
            return
        }

        // Topic reordering within same module
        if (activeData?.type === 'topic') {
            const activeModuleId = activeData.moduleId
            let overModuleId = overData?.moduleId || activeModuleId

            // Find which module the topic was dropped into
            const overModule = modules.find((c: any) => c.topics.some((t: any) => t.id === over.id))
            if (overModule) overModuleId = overModule.id

            // Get topics from active and over modules
            const activeModule = modules.find((c: any) => c.id === activeModuleId)
            const targetModule = modules.find((c: any) => c.id === overModuleId)

            if (!activeModule || !targetModule) return

            const activeTopic = activeModule.topics.find((t: any) => t.id === active.id)
            if (!activeTopic) return

            // Same module reorder
            if (activeModuleId === overModuleId) {
                const oldIndex = targetModule.topics.findIndex((t: any) => t.id === active.id)
                const newIndex = targetModule.topics.findIndex((t: any) => t.id === over.id)
                const reorderedTopics = arrayMove(targetModule.topics, oldIndex, newIndex)

                setModules(modules.map((c: any) =>
                    c.id === activeModuleId ? { ...c, topics: reorderedTopics } : c
                ))

                await reorderTopics(
                    reorderedTopics.map((t: any, i) => ({ id: t.id, sortOrder: i, moduleId: activeModuleId })),
                    course.id
                )
            } else {
                // Move topic to different module
                const newActiveTopics = activeModule.topics.filter((t: any) => t.id !== active.id)
                const overIndex = targetModule.topics.findIndex((t: any) => t.id === over.id)
                const newTargetTopics = [...targetModule.topics]
                newTargetTopics.splice(overIndex >= 0 ? overIndex : newTargetTopics.length, 0, { ...activeTopic, moduleId: overModuleId })

                setModules(modules.map((c: any) => {
                    if (c.id === activeModuleId) return { ...c, topics: newActiveTopics }
                    if (c.id === overModuleId) return { ...c, topics: newTargetTopics }
                    return c
                }))

                // Update both modules
                const updates = [
                    ...newActiveTopics.map((t: any, i: number) => ({ id: t.id, sortOrder: i, moduleId: activeModuleId })),
                    ...newTargetTopics.map((t: any, i: number) => ({ id: t.id, sortOrder: i, moduleId: overModuleId }))
                ]
                await reorderTopics(updates, course.id)
            }
        }
    }

    const openAddModuleSheet = () => setSheetState({ mode: 'module', title: '' })
    const openAddTopicSheet = (moduleId: string) => setSheetState({ mode: 'topic', title: '', targetModuleId: moduleId })
    const openDeleteModuleSheet = (moduleId: string) => setSheetState({ mode: 'delete-module', title: '', targetModuleId: moduleId })
    const openDeleteTopicSheet = (topicId: string) => setSheetState({ mode: 'delete-topic', title: '', targetTopicId: topicId })
    const closeSheet = () => setSheetState({ mode: null, title: '' })

    const handleSheetSubmit = async () => {
        setIsLoading(true)
        try {
            if (sheetState.mode === 'module' && sheetState.title.trim()) {
                const newModule = await createModule(course.id, sheetState.title.trim())
                setModules([...modules, { ...newModule, topics: [] }])
                toast.success('Module created')
                closeSheet()
            } else if (sheetState.mode === 'topic' && sheetState.title.trim() && sheetState.targetModuleId) {
                const newTopic = await createTopic(sheetState.targetModuleId, sheetState.title.trim(), course.id)
                setModules(modules.map((c: any) =>
                    c.id === sheetState.targetModuleId
                        ? { ...c, topics: [...c.topics, { ...newTopic, resources: [], moduleId: c.id }] }
                        : c
                ))
                toast.success('Topic created')
                closeSheet()
            } else if (sheetState.mode === 'delete-module' && sheetState.targetModuleId) {
                await deleteModule(sheetState.targetModuleId, course.id)
                setModules(modules.filter((c: any) => c.id !== sheetState.targetModuleId))
                toast.success('Module deleted')
                closeSheet()
            } else if (sheetState.mode === 'delete-topic' && sheetState.targetTopicId) {
                await deleteTopic(sheetState.targetTopicId, course.id)
                setModules(modules.map((c: any) => ({
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
            case 'module': return 'Add New Module'
            case 'topic': return 'Add New Topic'
            case 'delete-module': return 'Delete Module'
            case 'delete-topic': return 'Delete Topic'
            default: return ''
        }
    }

    const getSheetDescription = () => {
        switch (sheetState.mode) {
            case 'module': return 'Enter a title for the new module.'
            case 'topic': return 'Enter a title for the new topic.'
            case 'delete-module': return 'Are you sure? This will delete all topics in this module.'
            case 'delete-topic': return 'Are you sure? This will delete all resources in this topic.'
            default: return ''
        }
    }

    const isDeleteMode = sheetState.mode === 'delete-module' || sheetState.mode === 'delete-topic'

    // Callback to refresh topic resources after edit
    const handleTopicUpdate = (topicId: string, newResources: any[]) => {
        setModules(modules.map((c: any) => ({
            ...c,
            topics: c.topics.map((t: any) => t.id === topicId ? { ...t, resources: newResources } : t)
        })))
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <header className="flex justify-between items-center border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{course.title}</h1>
                    <p className="text-gray-400">Drag modules or topics to reorder. Click topics to add content.</p>
                </div>
                <div className="flex gap-2">
                    <CourseSkillsManager
                        courseId={course.id}
                        initialStatus={course.skills.map((s: any) => s.id)}
                        allSkills={allSkills}
                    />
                    <Button onClick={openAddModuleSheet} className="bg-white text-black hover:bg-gray-200">
                        <Plus className="w-4 h-4 mr-2" /> New Module
                    </Button>
                </div>
            </header>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={modules.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                        {modules.map((module: any) => (
                            <SortableModule key={module.id} id={module.id}>
                                <div className="flex-1 bg-[#16181d] border border-white/5 rounded-xl overflow-hidden group">
                                    <div className="p-4 bg-white/5 flex justify-between items-center border-b border-white/5">
                                        <h2 className="font-semibold text-lg">{module.title}</h2>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="ghost" onClick={() => openAddTopicSheet(module.id)}>
                                                <Plus className="w-4 h-4 mr-1" /> Add Topic
                                            </Button>
                                            <Button size="icon" variant="ghost" className="text-red-400" onClick={() => openDeleteModuleSheet(module.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-2">
                                        {module.topics.length === 0 && (
                                            <div className="text-sm text-gray-600 italic py-4 text-center">No topics yet. Add one above.</div>
                                        )}
                                        <SortableContext items={module.topics.map((t: any) => t.id)} strategy={verticalListSortingStrategy}>
                                            {module.topics.map((topic: any) => (
                                                <SortableTopic
                                                    key={topic.id}
                                                    id={topic.id}
                                                    topic={{ ...topic, moduleId: module.id }}
                                                    courseId={course.id}
                                                    onEdit={() => setEditingTopic({ ...topic, moduleId: module.id })}
                                                    onDelete={() => openDeleteTopicSheet(topic.id)}
                                                />
                                            ))}
                                        </SortableContext>
                                    </div>
                                </div>
                            </SortableModule>
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
                                placeholder={sheetState.mode === 'module' ? 'e.g. Getting Started' : 'e.g. Introduction Video'}
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
