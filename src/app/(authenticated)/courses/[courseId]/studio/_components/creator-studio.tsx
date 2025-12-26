'use client'

import { createModule, createTopic, createTopicResource, deleteModule, deleteTopic, deleteTopicResource, reorderModules, reorderTopics, updateModule, updateTopic } from '@/app/actions/course-editor.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Sheet,
    SheetContent,
    SheetDescription, SheetFooter, SheetHeader,
    SheetTitle
} from "@/components/ui/sheet"
import { closestCenter, DndContext, DragEndEvent, DragStartEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Trash2, ChevronsDown, ChevronsUp, Pencil } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { VideoEditorDrawer } from './video-editor-drawer'
import { ReadingEditorDrawer } from './reading-editor-drawer'
import { QuizEditorDrawer } from './quiz-editor-drawer'
import { SortableModule } from './sortable-module'
import { SortableTopic } from './sortable-topic'
import { CourseSkillsManager } from '@/components/course/course-skills-manager'
import { CourseEditorDrawer } from './course-editor-drawer'

// --- INPUT SHEET STATE ---
type SheetMode = 'module' | 'topic' | 'delete-module' | 'delete-topic' | 'edit-module' | 'edit-topic' | null

interface InputSheetState {
    mode: SheetMode
    title: string
    description: string
    targetModuleId?: string
    targetTopicId?: string
}

// --- MAIN COMPONENT ---
export function CreatorStudio({ course, allSkills }: { course: any, allSkills: any[] }) {
    const [modules, setModules] = useState(course.modules)
    const [editingResource, setEditingResource] = useState<{ resource: any, topicId: string } | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [sheetState, setSheetState] = useState<InputSheetState>({ mode: null, title: '', description: '' })
    const [activeId, setActiveId] = useState<string | null>(null)
    const [activeType, setActiveType] = useState<'module' | 'topic' | null>(null)
    const [addingResourceToTopicId, setAddingResourceToTopicId] = useState<string | null>(null)

    // Description Drawer State
    const [isDescriptionDrawerOpen, setIsDescriptionDrawerOpen] = useState(false)
    const [courseTitle, setCourseTitle] = useState(course.title)
    const [courseDescription, setCourseDescription] = useState(course.description || '')

    // Expand/collapse state for modules and topics
    const [expandedModules, setExpandedModules] = useState<Set<string>>(() => new Set(course.modules.map((m: any) => m.id)))
    const [expandedTopics, setExpandedTopics] = useState<Set<string>>(() => new Set(course.modules.flatMap((m: any) => m.topics.map((t: any) => t.id))))

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => {
            const next = new Set(prev)
            if (next.has(moduleId)) next.delete(moduleId)
            else next.add(moduleId)
            return next
        })
    }

    const toggleTopic = (topicId: string) => {
        setExpandedTopics(prev => {
            const next = new Set(prev)
            if (next.has(topicId)) next.delete(topicId)
            else next.add(topicId)
            return next
        })
    }

    const expandAll = () => {
        setExpandedModules(new Set(modules.map((m: any) => m.id)))
        setExpandedTopics(new Set(modules.flatMap((m: any) => m.topics.map((t: any) => t.id))))
    }

    const collapseAll = () => {
        setExpandedModules(new Set())
        setExpandedTopics(new Set())
    }

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

    const openAddModuleSheet = () => setSheetState({ mode: 'module', title: '', description: '' })
    const openAddTopicSheet = (moduleId: string) => setSheetState({ mode: 'topic', title: '', description: '', targetModuleId: moduleId })
    const openDeleteModuleSheet = (moduleId: string) => setSheetState({ mode: 'delete-module', title: '', description: '', targetModuleId: moduleId })
    const openDeleteTopicSheet = (topicId: string) => setSheetState({ mode: 'delete-topic', title: '', description: '', targetTopicId: topicId })
    const openEditModuleSheet = (module: any) => setSheetState({ mode: 'edit-module', title: module.title, description: module.description || '', targetModuleId: module.id })
    const openEditTopicSheet = (topic: any) => setSheetState({ mode: 'edit-topic', title: topic.title, description: topic.description || '', targetTopicId: topic.id })
    const closeSheet = () => setSheetState({ mode: null, title: '', description: '' })

    const handleSheetSubmit = async () => {
        setIsLoading(true)
        try {
            if (sheetState.mode === 'module' && sheetState.title.trim()) {
                const newModule = await createModule(course.id, sheetState.title.trim(), sheetState.description)
                setModules([...modules, { ...newModule, topics: [] }])
                toast.success('Module created')
                closeSheet()
            } else if (sheetState.mode === 'topic' && sheetState.title.trim() && sheetState.targetModuleId) {
                const newTopic = await createTopic(sheetState.targetModuleId, sheetState.title.trim(), course.id, sheetState.description)
                setModules(modules.map((c: any) =>
                    c.id === sheetState.targetModuleId
                        ? { ...c, topics: [...c.topics, { ...newTopic, resources: [], moduleId: c.id }] }
                        : c
                ))
                toast.success('Topic created')
                closeSheet()
            } else if (sheetState.mode === 'edit-module' && sheetState.targetModuleId && sheetState.title.trim()) {
                await updateModule(sheetState.targetModuleId, course.id, sheetState.title.trim(), sheetState.description)
                setModules(modules.map((m: any) => m.id === sheetState.targetModuleId ? { ...m, title: sheetState.title.trim(), description: sheetState.description } : m))
                toast.success('Module updated')
                closeSheet()
            } else if (sheetState.mode === 'edit-topic' && sheetState.targetTopicId && sheetState.title.trim()) {
                await updateTopic(sheetState.targetTopicId, course.id, sheetState.title.trim(), sheetState.description)
                setModules(modules.map((m: any) => ({
                    ...m,
                    topics: m.topics.map((t: any) => t.id === sheetState.targetTopicId ? { ...t, title: sheetState.title.trim(), description: sheetState.description } : t)
                })))
                toast.success('Topic updated')
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
            case 'edit-module': return 'Edit Module'
            case 'edit-topic': return 'Edit Topic'
            case 'delete-module': return 'Delete Module'
            case 'delete-topic': return 'Delete Topic'
            default: return ''
        }
    }

    const getSheetDescription = () => {
        switch (sheetState.mode) {
            case 'module': return 'Enter a title and description for the new module.'
            case 'topic': return 'Enter a title and description for the new topic.'
            case 'edit-module': return 'Update module details.'
            case 'edit-topic': return 'Update topic details.'
            case 'delete-module': return 'Are you sure? This will delete all topics in this module.'
            case 'delete-topic': return 'Are you sure? This will delete all resources in this topic.'
            default: return ''
        }
    }

    const isDeleteMode = sheetState.mode === 'delete-module' || sheetState.mode === 'delete-topic'

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <header className="flex justify-between items-start border-b border-white/10 pb-6">
                <div className="max-w-[60%]">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{courseTitle}</h1>
                    <p className="text-gray-400 text-sm">{courseDescription || "No description provided."}</p>
                </div>
                <div className="flex gap-2 items-center">
                    <CourseSkillsManager
                        courseId={course.id}
                        initialStatus={course.skills.map((s: any) => s.id)}
                        allSkills={allSkills}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsDescriptionDrawerOpen(true)}
                        className="text-gray-400 hover:text-white"
                        title="Edit Description"
                    >
                        <Pencil className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            <div className="flex justify-end gap-2 items-center">
                <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    onClick={openAddModuleSheet}
                    data-testid="new-module-button"
                >
                    <Plus className="w-4 h-4 mr-1" /> Add Module
                </Button>
                <Button variant="ghost" size="sm" onClick={expandAll} className="text-gray-400 hover:text-white" title="Expand All">
                    <ChevronsDown className="w-4 h-4 mr-1" /> Expand All
                </Button>
                <Button variant="ghost" size="sm" onClick={collapseAll} className="text-gray-400 hover:text-white" title="Collapse All">
                    <ChevronsUp className="w-4 h-4 mr-1" /> Collapse All
                </Button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={modules.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4" data-testid="modules-list">
                        {modules.map((module: any) => (
                            <SortableModule
                                key={module.id}
                                id={module.id}
                                title={module.title}
                                description={module.description}
                                isExpanded={expandedModules.has(module.id)}
                                onToggle={() => toggleModule(module.id)}
                                onEdit={() => openEditModuleSheet(module)}
                                actions={
                                    <>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-white hover:bg-white/10"
                                            onClick={() => openAddTopicSheet(module.id)}
                                            data-testid={`add-topic-btn-${module.id}`}
                                        >
                                            <Plus className="w-4 h-4 mr-1" /> Add Topic
                                        </Button>
                                        <Button size="icon" variant="ghost" className="text-gray-400 hover:text-white" onClick={() => openEditModuleSheet(module)} data-testid={`edit-module-btn-${module.id}`}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="text-red-400" onClick={() => openDeleteModuleSheet(module.id)} data-testid={`delete-module-btn-${module.id}`}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </>
                                }
                            >
                                {expandedModules.has(module.id) && (
                                    <div className="p-4 space-y-2" data-testid={`module-content-${module.id}`}>
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
                                                    onDelete={() => openDeleteTopicSheet(topic.id)}
                                                    onEdit={() => openEditTopicSheet(topic)}
                                                    onAddResource={async (type) => {
                                                        setAddingResourceToTopicId(topic.id)
                                                        try {
                                                            const newResource = await createTopicResource(topic.id, type, {}, course.id)
                                                            setModules(modules.map((m: any) => ({
                                                                ...m,
                                                                topics: m.topics.map((t: any) =>
                                                                    t.id === topic.id
                                                                        ? { ...t, resources: [...(t.resources || []), newResource] }
                                                                        : t
                                                                )
                                                            })))
                                                            toast.success(`${type} added successfully`)
                                                            // Open the resource-specific editor
                                                            setEditingResource({ resource: newResource, topicId: topic.id })
                                                        } catch (error) {
                                                            toast.error('Failed to add resource')
                                                        } finally {
                                                            setAddingResourceToTopicId(null)
                                                        }
                                                    }}
                                                    onResourcesReorder={(reorderedResources) => {
                                                        setModules(modules.map((m: any) => ({
                                                            ...m,
                                                            topics: m.topics.map((t: any) =>
                                                                t.id === topic.id
                                                                    ? { ...t, resources: reorderedResources }
                                                                    : t
                                                            )
                                                        })))
                                                    }}
                                                    onResourceDelete={async (resourceId) => {
                                                        try {
                                                            await deleteTopicResource(resourceId, course.id)
                                                            setModules(modules.map((m: any) => ({
                                                                ...m,
                                                                topics: m.topics.map((t: any) =>
                                                                    t.id === topic.id
                                                                        ? { ...t, resources: (t.resources || []).filter((r: any) => r.id !== resourceId) }
                                                                        : t
                                                                )
                                                            })))
                                                            toast.success('Resource deleted')
                                                        } catch (error) {
                                                            toast.error('Failed to delete resource')
                                                        }
                                                    }}
                                                    onResourceEdit={(resource) => setEditingResource({ resource, topicId: topic.id })}
                                                    isAddingResource={addingResourceToTopicId === topic.id}
                                                    isExpanded={expandedTopics.has(topic.id)}
                                                    onToggle={() => toggleTopic(topic.id)}
                                                />
                                            ))}
                                        </SortableContext>
                                    </div>
                                )}
                            </SortableModule>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Resource-specific editors */}
            {
                editingResource?.resource?.type === 'VIDEO' && (
                    <VideoEditorDrawer
                        courseId={course.id}
                        resource={editingResource.resource}
                        open={true}
                        onOpenChange={(open) => !open && setEditingResource(null)}
                        onResourceUpdate={(updatedResource) => {
                            setModules(modules.map((m: any) => ({
                                ...m,
                                topics: m.topics.map((t: any) =>
                                    t.id === editingResource.topicId
                                        ? { ...t, resources: t.resources.map((r: any) => r.id === updatedResource.id ? updatedResource : r) }
                                        : t
                                )
                            })))
                        }}
                    />
                )
            }

            {
                editingResource?.resource?.type === 'PDF' && (
                    <ReadingEditorDrawer
                        courseId={course.id}
                        resource={editingResource.resource}
                        open={true}
                        onOpenChange={(open) => !open && setEditingResource(null)}
                        onResourceUpdate={(updatedResource) => {
                            setModules(modules.map((m: any) => ({
                                ...m,
                                topics: m.topics.map((t: any) =>
                                    t.id === editingResource.topicId
                                        ? { ...t, resources: t.resources.map((r: any) => r.id === updatedResource.id ? updatedResource : r) }
                                        : t
                                )
                            })))
                        }}
                    />
                )
            }

            {
                editingResource?.resource?.type === 'QUIZ' && (
                    <QuizEditorDrawer
                        courseId={course.id}
                        resource={editingResource.resource}
                        open={true}
                        onOpenChange={(open) => !open && setEditingResource(null)}
                        onResourceUpdate={(updatedResource) => {
                            setModules(modules.map((m: any) => ({
                                ...m,
                                topics: m.topics.map((t: any) =>
                                    t.id === editingResource.topicId
                                        ? { ...t, resources: t.resources.map((r: any) => r.id === updatedResource.id ? updatedResource : r) }
                                        : t
                                )
                            })))
                        }}
                    />
                )
            }

            <CourseEditorDrawer
                courseId={course.id}
                initialTitle={courseTitle}
                initialDescription={courseDescription}
                open={isDescriptionDrawerOpen}
                onOpenChange={setIsDescriptionDrawerOpen}
                onDetailsUpdate={(newTitle, newDescription) => {
                    setCourseTitle(newTitle)
                    setCourseDescription(newDescription)
                }}
            />

            <Sheet open={sheetState.mode !== null} onOpenChange={(open) => !open && closeSheet()}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{getSheetTitle()}</SheetTitle>
                        <SheetDescription>{getSheetDescription()}</SheetDescription>
                    </SheetHeader>

                    {!isDeleteMode && (
                        <div className="py-6 space-y-4">
                            <Input
                                autoFocus
                                placeholder={sheetState.mode === 'module' || sheetState.mode === 'edit-module' ? 'e.g. Getting Started' : 'e.g. Introduction Video'}
                                value={sheetState.title}
                                onChange={(e) => setSheetState({ ...sheetState, title: e.target.value })}
                                onKeyDown={(e) => { if (e.key === 'Enter' && sheetState.title.trim()) handleSheetSubmit() }}
                                data-testid="sheet-title-input"
                            />
                            <Textarea
                                placeholder="Description (optional)"
                                value={sheetState.description}
                                onChange={(e) => setSheetState({ ...sheetState, description: e.target.value })}
                                data-testid="sheet-description-input"
                            />
                        </div>
                    )}

                    <SheetFooter className="mt-4">
                        <Button variant="outline" onClick={closeSheet} disabled={isLoading}>Cancel</Button>
                        <Button
                            onClick={handleSheetSubmit}
                            disabled={isLoading || (!isDeleteMode && !sheetState.title.trim())}
                            variant={isDeleteMode ? "destructive" : "default"}
                            data-testid="sheet-submit-button"
                        >
                            {isLoading ? 'Processing...' : isDeleteMode ? 'Delete' : (sheetState.mode === 'edit-module' || sheetState.mode === 'edit-topic') ? 'Save Changes' : 'Create'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div >
    )
}
