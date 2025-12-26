'use client'

import { Button } from '@/components/ui/button'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'

interface SortableModuleProps {
    id: string
    title: string
    description?: string
    children: React.ReactNode
    actions?: React.ReactNode
    isExpanded: boolean
    onToggle: () => void
    onEdit: () => void
}

export function SortableModule({ id, title, description, children, actions, isExpanded, onToggle, onEdit }: SortableModuleProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, data: { type: 'module' } })
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

    return (
        <div ref={setNodeRef} style={style} className="mb-4">
            <div className="flex-1 bg-[#16181d] border border-white/5 rounded-xl overflow-hidden group">
                <div className="p-4 bg-white/5 flex items-center gap-3 border-b border-white/5">
                    {/* Drag Handle */}
                    <div {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-white" data-testid={`drag-handle-module-${id}`}>
                        <GripVertical className="w-5 h-5" />
                    </div>

                    {/* Expand/Collapse Toggle */}
                    <Button size="icon" variant="ghost" onClick={onToggle} className="h-6 w-6 text-gray-500 hover:text-white" data-testid={`toggle-module-${id}`}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>

                    <div className="flex-1 cursor-pointer select-none" onClick={onToggle} data-testid={`module-title-${id}`}>
                        <h2 className="font-semibold text-lg hover:text-gray-300 transition-colors">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{description}</p>
                        )}
                    </div>

                    {actions && (
                        <div className="flex gap-2">
                            {actions}
                        </div>
                    )}
                </div>
                {children}
            </div>
        </div>
    )
}
