'use client'

import { reorderTopicResources } from '@/app/actions/course-editor.actions'
import { Button } from '@/components/ui/button'
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, Eye, FileText, GripVertical, HelpCircle, Trash2, Video } from 'lucide-react'
import { SortableResource } from './SortableResource'

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
    onToggle
}: SortableTopicProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { type: 'topic', moduleId: topic.moduleId } })
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

    const resources = topic.resources || []
    const videoCount = resources.filter((r: any) => r.type === 'VIDEO').length
    const pdfCount = resources.filter((r: any) => r.type === 'PDF').length
    const quizCount = resources.filter((r: any) => r.type === 'QUIZ').length

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
            <div className="flex items-start gap-2">
                {/* Grip and toggle outside the card - like modules */}
                <div className="flex flex-col items-center gap-1 mt-3">
                    <div {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-white">
                        <GripVertical className="w-4 h-4" />
                    </div>
                    <Button size="icon" variant="ghost" onClick={onToggle} className="h-5 w-5 text-gray-500 hover:text-white">
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </Button>
                </div>

                {/* Topic Card */}
                <div className="flex-1 bg-black/20 rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors">
                    {/* Topic Header */}
                    <div className="p-3 bg-white/5 flex items-center gap-3 border-b border-white/5">
                        <h3
                            className="font-medium text-sm text-gray-200 flex-1 cursor-pointer hover:text-white transition-colors"
                            onClick={onToggle}
                            title="Click to expand/collapse"
                        >
                            {topic.title}
                        </h3>

                        {/* Resource Count Badges */}
                        <div className="flex gap-2">
                            {videoCount > 0 && (
                                <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                                    <Video className="w-3 h-3" /> {videoCount}
                                </span>
                            )}
                            {pdfCount > 0 && (
                                <span className="flex items-center gap-1 text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                                    <FileText className="w-3 h-3" /> {pdfCount}
                                </span>
                            )}
                            {quizCount > 0 && (
                                <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                                    <HelpCircle className="w-3 h-3" /> {quizCount}
                                </span>
                            )}
                        </div>

                        {/* Preview & Delete */}
                        <div className="flex gap-1">
                            <a
                                href={`/courses/${courseId}/learn/${topic.id}?preview=true`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                title="Preview as Student"
                            >
                                <Eye className="w-4 h-4" />
                            </a>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="text-red-400 hover:bg-red-500/10 h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); onDelete() }}
                                title="Delete Topic"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Action Buttons Row - only when expanded */}
                    {isExpanded && (
                        <div className="p-2 flex items-center gap-2 border-b border-white/5">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                                onClick={(e) => { e.stopPropagation(); onAddResource('VIDEO') }}
                                disabled={isAddingResource}
                            >
                                <Video className="w-3 h-3 mr-1" /> Add Video
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                                onClick={(e) => { e.stopPropagation(); onAddResource('PDF') }}
                                disabled={isAddingResource}
                            >
                                <FileText className="w-3 h-3 mr-1" /> Add Reading
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-green-400 hover:bg-green-500/10 hover:text-green-300"
                                onClick={(e) => { e.stopPropagation(); onAddResource('QUIZ') }}
                                disabled={isAddingResource}
                            >
                                <HelpCircle className="w-3 h-3 mr-1" /> Add Quiz
                            </Button>
                        </div>
                    )}

                    {/* Resources List with Drag & Drop - only when expanded */}
                    {isExpanded && resources.length > 0 && (
                        <div className="p-2 space-y-1.5">
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
        </div>
    )
}
