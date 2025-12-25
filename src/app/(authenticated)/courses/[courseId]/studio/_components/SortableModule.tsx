'use client'

import { Button } from '@/components/ui/button'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'

interface SortableModuleProps {
    id: string
    children: React.ReactNode
    isExpanded: boolean
    onToggle: () => void
}

export function SortableModule({ id, children, isExpanded, onToggle }: SortableModuleProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { type: 'module' } })
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

    return (
        <div ref={setNodeRef} style={style} className="mb-4">
            <div className="flex items-start gap-2">
                <div className="flex flex-col items-center gap-1 mt-4">
                    <div {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-white">
                        <GripVertical className="w-5 h-5" />
                    </div>
                    <Button size="icon" variant="ghost" onClick={onToggle} className="h-6 w-6 text-gray-500 hover:text-white">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                </div>
                {children}
            </div>
        </div>
    )
}
