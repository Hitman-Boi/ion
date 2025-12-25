'use client'

import { Button } from '@/components/ui/button'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FileText, GripVertical, HelpCircle, Trash2, Video } from 'lucide-react'

interface SortableResourceProps {
    resource: any
    onDelete: () => void
    onEdit: (resource: any) => void
}

export function SortableResource({ resource, onDelete, onEdit }: SortableResourceProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: resource.id })
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

    const getTypeIcon = () => {
        switch (resource.type) {
            case 'VIDEO': return <Video className="w-4 h-4 text-blue-400" />
            case 'PDF': return <FileText className="w-4 h-4 text-purple-400" />
            case 'QUIZ': return <HelpCircle className="w-4 h-4 text-green-400" />
        }
    }

    const getTypeBg = () => {
        switch (resource.type) {
            case 'VIDEO': return 'border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10'
            case 'PDF': return 'border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10'
            case 'QUIZ': return 'border-green-500/20 bg-green-500/5 hover:bg-green-500/10'
        }
    }

    const getTypeLabel = () => {
        switch (resource.type) {
            case 'VIDEO': return 'Video'
            case 'PDF': return 'Reading'
            case 'QUIZ': return 'Quiz'
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${getTypeBg()}`}
            onClick={() => onEdit(resource)}
        >
            <div {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-white" onClick={(e) => e.stopPropagation()}>
                <GripVertical className="w-3 h-3" />
            </div>
            {getTypeIcon()}
            <span className="flex-1 text-xs text-gray-400">
                {getTypeLabel()}
            </span>
            <Button
                size="icon"
                variant="ghost"
                className="text-red-400 hover:bg-red-500/10 h-5 w-5"
                onClick={(e) => { e.stopPropagation(); onDelete() }}
            >
                <Trash2 className="w-3 h-3" />
            </Button>
        </div>
    )
}
