'use client'

import { reorderTopicResources } from '@/app/actions/course-editor.actions'
import { Button } from '@/components/ui/button'
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, Eye, FileText, GripVertical, HelpCircle, Trash2, Video } from 'lucide-react'
import { SortableResource } from './sortable-resource'

interface SortableTopicProps {
    id: string
    topic: any
    courseId: string
    onDelete: () => void
    onAddResource: (type: 'VIDEO' | 'PDF' | 'QUIZ') => void
    onResourcesReorder: (resources: any[]) => void
    onResourceDelete: (resourceId: string) => void
    onResourceEdit: (resource: any) => void
    isAddingResource: boolean
    isExpanded: boolean
    onToggle: () => void
    onEdit: () => void
}

export function SortableTopic({
    id,
    topic,
    courseId,
    onDelete,
    onAddResource,
    onResourcesReorder,
    onResourceDelete,
    onResourceEdit,
    isAddingResource,
    isExpanded,
    onToggle,
    onEdit
}: SortableTopicProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { type: 'topic', moduleId: topic.moduleId } })
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

    const resources = topic.resources || []


    const resourceSensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleResourceDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = resources.findIndex((r: any) => r.id === active.id)
        const newIndex = resources.findIndex((r: any) => r.id === over.id)
        const reordered = arrayMove(resources, oldIndex, newIndex)

        onResourcesReorder(reordered)

        await reorderTopicResources(
            reordered.map((r: any, i: number) => ({ id: r.id, sortOrder: i })),
            courseId
        )
    }

    return (
        <div ref={setNodeRef} style={style} className="mb-3">
            <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors">
                {/* Topic Header */}
                <div className="p-3 bg-white/5 flex items-center gap-3 border-b border-white/5">
                    {/* Drag Handle */}
                    <div {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-white" data-testid={`drag-handle-topic-${id}`}>
                        <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Expand/Collapse Toggle */}
                    <Button size="icon" variant="ghost" onClick={onToggle} className="h-5 w-5 text-gray-500 hover:text-white" data-testid={`toggle-topic-${id}`}>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </Button>

                    <div
                        className="flex-1 cursor-pointer"
                        onClick={onToggle}
                        title="Click to expand/collapse"
                        data-testid={`topic-title-${id}`}
                    >
                        <h3 className="font-medium text-sm text-gray-200 hover:text-white transition-colors">
                            {topic.title}
                        </h3>
                        {topic.description && (
                            <p className="text-xs text-gray-500 mt-0.5 whitespace-pre-wrap">{topic.description}</p>
                        )}
                    </div>



                    {/* Preview, Edit & Delete */}
                    <div className="flex gap-2 items-center">
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                                onClick={(e) => { e.stopPropagation(); onAddResource('VIDEO') }}
                                disabled={isAddingResource}
                                data-testid={`add-video-${id}`}
                            >
                                <Video className="w-3 h-3 mr-1" /> Add Video
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                                onClick={(e) => { e.stopPropagation(); onAddResource('PDF') }}
                                disabled={isAddingResource}
                                data-testid={`add-pdf-${id}`}
                            >
                                <FileText className="w-3 h-3 mr-1" /> Add Reading
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-green-400 hover:bg-green-500/10 hover:text-green-300"
                                onClick={(e) => { e.stopPropagation(); onAddResource('QUIZ') }}
                                disabled={isAddingResource}
                                data-testid={`add-quiz-${id}`}
                            >
                                <HelpCircle className="w-3 h-3 mr-1" /> Add Quiz
                            </Button>
                        </div>

                        <a
                            href={`/courses/${courseId}/topic/${topic.id}?preview=true`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Preview as Student"
                            data-testid={`preview-topic-${id}`}
                        >
                            <Eye className="w-4 h-4" />
                        </a>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10"
                            onClick={(e) => { e.stopPropagation(); onEdit() }}
                            title="Edit Topic"
                            data-testid={`edit-topic-${id}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil w-3 h-3"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-400 hover:bg-red-500/10 h-7 w-7"
                            onClick={(e) => { e.stopPropagation(); onDelete() }}
                            title="Delete Topic"
                            data-testid={`delete-topic-${id}`}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>



                {/* Resources List with Drag & Drop - only when expanded */}
                {isExpanded && resources.length > 0 && (
                    <div className="p-4 space-y-2">
                        <DndContext
                            sensors={resourceSensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleResourceDragEnd}
                        >
                            <SortableContext items={resources.map((r: any) => r.id)} strategy={verticalListSortingStrategy}>
                                {resources.map((resource: any) => (
                                    <SortableResource
                                        key={resource.id}
                                        resource={resource}
                                        onEdit={onResourceEdit}
                                        onDelete={() => onResourceDelete(resource.id)}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                )}
            </div>
        </div>
    )
}
