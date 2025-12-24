'use client'

import { createTopicResource, deleteTopicResource, reorderTopicResources, updateTopicResource } from '@/app/actions/course-editor.actions'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, FileText, GripVertical, HelpCircle, Loader2, Plus, Trash2, Upload, Video } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface TopicEditorDrawerProps {
    courseId: string
    topicId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    initialResources: any[]
    onResourcesChange?: (resources: any[]) => void
}

// Sortable Resource Item
function SortableResourceItem({ resource, onUpdate, onDelete, isExpanded, onToggle }: {
    resource: any
    onUpdate: (data: any) => void
    onDelete: () => void
    isExpanded: boolean
    onToggle: () => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: resource.id })
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

    const [loading, setLoading] = useState(false)
    const [contentUrl, setContentUrl] = useState(resource.contentUrl || '')
    const [title, setTitle] = useState(resource.title || '')
    const [quizDataStr, setQuizDataStr] = useState(JSON.stringify(resource.quizData || { questions: [] }, null, 2))

    const getTypeIcon = () => {
        switch (resource.type) {
            case 'VIDEO': return <Video className="w-4 h-4 text-blue-400" />
            case 'PDF': return <FileText className="w-4 h-4 text-purple-400" />
            case 'QUIZ': return <HelpCircle className="w-4 h-4 text-green-400" />
        }
    }

    const getTypeBg = () => {
        switch (resource.type) {
            case 'VIDEO': return 'border-blue-500/30 bg-blue-500/5'
            case 'PDF': return 'border-purple-500/30 bg-purple-500/5'
            case 'QUIZ': return 'border-green-500/30 bg-green-500/5'
        }
    }

    const handleUpload = async (file: File) => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch('/api/upload', { method: 'POST', body: formData })
            const data = await res.json()
            if (data.url) {
                setContentUrl(data.url)
                toast.success('File uploaded')
            }
        } catch (e) {
            toast.error('Upload failed')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const data: any = { title }
            if (resource.type === 'QUIZ') {
                data.quizData = JSON.parse(quizDataStr)
            } else {
                data.contentUrl = contentUrl
            }
            await onUpdate(data)
            toast.success('Saved')
        } catch (e) {
            toast.error('Save failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div ref={setNodeRef} style={style} className={`border rounded-lg mb-3 ${getTypeBg()}`}>
            <div className="flex items-center gap-3 p-3">
                <div {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-white">
                    <GripVertical className="w-4 h-4" />
                </div>
                {getTypeIcon()}
                <span className="flex-1 text-sm font-medium">{title || resource.type}</span>
                <Button size="icon" variant="ghost" onClick={onToggle} className="h-6 w-6">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="ghost" className="text-red-400 h-6 w-6" onClick={onDelete}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>

            {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-white/10 pt-3">
                    <div className="space-y-2">
                        <Label className="text-xs">Title</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Resource title"
                            className="bg-white/5 border-white/10 h-8 text-sm"
                        />
                    </div>

                    {resource.type !== 'QUIZ' ? (
                        <div className="space-y-2">
                            <Label className="text-xs">URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={contentUrl}
                                    onChange={(e) => setContentUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="bg-white/5 border-white/10 h-8 text-sm flex-1"
                                />
                                <Button variant="outline" size="sm" className="relative overflow-hidden h-8">
                                    <input
                                        type="file"
                                        accept={resource.type === 'VIDEO' ? 'video/*' : '.pdf'}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                                    />
                                    <Upload className="w-3 h-3 mr-1" /> Upload
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label className="text-xs">Quiz JSON</Label>
                            <textarea
                                value={quizDataStr}
                                onChange={(e) => setQuizDataStr(e.target.value)}
                                className="w-full h-32 bg-white/5 border border-white/10 rounded-md p-2 font-mono text-xs"
                                placeholder='{"questions":[{"q":"Question?","options":["A","B"],"answer":"A"}]}'
                            />
                        </div>
                    )}

                    <Button onClick={handleSave} disabled={loading} size="sm" className="w-full h-8">
                        {loading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />} Save
                    </Button>
                </div>
            )}
        </div>
    )
}

export function TopicEditorDrawer({ courseId, topicId, open, onOpenChange, initialResources, onResourcesChange }: TopicEditorDrawerProps) {
    const [resources, setResources] = useState(initialResources)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return

        const oldIndex = resources.findIndex((r: any) => r.id === active.id)
        const newIndex = resources.findIndex((r: any) => r.id === over.id)
        const reordered = arrayMove(resources, oldIndex, newIndex)
        setResources(reordered)
        onResourcesChange?.(reordered)

        await reorderTopicResources(
            reordered.map((r: any, i) => ({ id: r.id, sortOrder: i })),
            courseId
        )
    }

    const handleAddResource = async (type: 'VIDEO' | 'PDF' | 'QUIZ') => {
        setLoading(true)
        try {
            const newResource = await createTopicResource(topicId, type, {}, courseId)
            const updated = [...resources, newResource]
            setResources(updated)
            onResourcesChange?.(updated)
            setExpandedId(newResource.id)
            toast.success(`${type} added`)
        } catch (e) {
            toast.error('Failed to add resource')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateResource = async (resourceId: string, data: any) => {
        await updateTopicResource(resourceId, data, courseId)
        const updated = resources.map((r: any) => r.id === resourceId ? { ...r, ...data } : r)
        setResources(updated)
        onResourcesChange?.(updated)
    }

    const handleDeleteResource = async (resourceId: string) => {
        await deleteTopicResource(resourceId, courseId)
        const updated = resources.filter((r: any) => r.id !== resourceId)
        setResources(updated)
        onResourcesChange?.(updated)
        toast.success('Resource deleted')
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col bg-[#0f1115] border-white/10 text-white overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="text-white">Edit Topic Resources</SheetTitle>
                </SheetHeader>

                <div className="flex gap-2 mb-4 mt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddResource('VIDEO')}
                        disabled={loading}
                        className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                    >
                        <Video className="w-4 h-4 mr-2" /> Add Video
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddResource('PDF')}
                        disabled={loading}
                        className="flex-1 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                    >
                        <FileText className="w-4 h-4 mr-2" /> Add PDF
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddResource('QUIZ')}
                        disabled={loading}
                        className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                        <HelpCircle className="w-4 h-4 mr-2" /> Add Quiz
                    </Button>
                </div>

                <div className="flex-1">
                    {resources.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Plus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No resources yet. Add a video, PDF, or quiz above.</p>
                        </div>
                    ) : (
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={resources.map((r: any) => r.id)} strategy={verticalListSortingStrategy}>
                                {resources.map((resource: any) => (
                                    <SortableResourceItem
                                        key={resource.id}
                                        resource={resource}
                                        isExpanded={expandedId === resource.id}
                                        onToggle={() => setExpandedId(expandedId === resource.id ? null : resource.id)}
                                        onUpdate={(data) => handleUpdateResource(resource.id, data)}
                                        onDelete={() => handleDeleteResource(resource.id)}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>

                <div className="pt-4 border-t border-white/10 text-xs text-gray-500 mt-auto">
                    Drag to reorder resources. Students will see them in this order.
                </div>
            </SheetContent>
        </Sheet>
    )
}
