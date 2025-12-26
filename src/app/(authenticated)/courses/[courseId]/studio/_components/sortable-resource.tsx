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



    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 py-4 px-4 rounded-lg border border-white/5 bg-[#1a1d24] cursor-pointer transition-all hover:border-white/10 group`}
            onClick={() => onEdit(resource)}
            data-testid={`resource-item-${resource.id}`}
        >
            <div {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-white" onClick={(e) => e.stopPropagation()} data-testid={`drag-handle-resource-${resource.id}`}>
                <GripVertical className="w-4 h-4" />
            </div>

            <div className={`p-1.5 rounded-md ${getTypeBg()} bg-opacity-10 border border-opacity-20 flex-shrink-0`}>
                {getTypeIcon()}
            </div>

            <span className="flex-1 font-medium text-sm text-gray-200 truncate" data-testid={`resource-summary-${resource.id}`}>
                {resource.summary || 'Resource'}
            </span>

            <Button
                size="icon"
                variant="ghost"
                className="text-red-400 hover:bg-red-500/10 h-7 w-7 transition-opacity"
                onClick={(e) => { e.stopPropagation(); onDelete() }}
                data-testid={`delete-resource-${resource.id}`}
            >
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>
    )
}
