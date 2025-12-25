"use client"

import { addLearningPathItem, deleteLearningPathItem, updateLearningPathOrder } from "@/app/actions/learning-paths.actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Check, GripVertical, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

interface PathBuilderProps {
    learningPath: any
    allCourses: any[]
}

export function PathBuilder({ learningPath, allCourses }: PathBuilderProps) {
    const [items, setItems] = useState(learningPath?.items || [])
    const router = useRouter()
    const [openAdd, setOpenAdd] = useState(false)
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (active.id !== over?.id) {
            setItems((items: any[]) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over?.id)

                const newItems = arrayMove(items, oldIndex, newIndex)

                // Update order on server
                const updates = newItems.map((item, index) => ({
                    id: item.id,
                    orderIndex: index
                }))

                updateLearningPathOrder(learningPath.id, updates).catch(() => {
                    toast.error("Failed to update order")
                    router.refresh()
                })

                return newItems
            })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteLearningPathItem(id)
            setItems(items.filter((item: any) => item.id !== id))
            toast.success("Item removed")
            router.refresh()
        } catch (error) {
            toast.error("Failed to remove item")
        }
    }

    const handleAddItem = async (courseId?: string, moduleId?: string) => {
        try {
            const newItem = await addLearningPathItem(learningPath.id, { courseId, moduleId })
            setItems([...items, { ...newItem, course: allCourses.find(c => c.id === courseId), module: null }]) // simplistic optimistic update
            toast.success("Item added")
            router.refresh()
            setOpenAdd(false)
            setSelectedCourseId(null)
        } catch (error) {
            toast.error("Failed to add item")
        }
    }

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Learning Path Sequence</h3>
                <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Step
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Content to Path</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Course</label>
                                <Combobox
                                    items={allCourses.map(c => ({ label: c.title, value: c.id }))}
                                    value={selectedCourseId}
                                    setValue={(val) => {
                                        setSelectedCourseId(val)
                                        // If user just wants to add the whole course
                                    }}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Course</label>
                                <Combobox
                                    items={allCourses.map(c => ({ label: c.title, value: c.id }))}
                                    value={selectedCourseId}
                                    setValue={(val) => {
                                        setSelectedCourseId(val)
                                    }}
                                />
                            </div>

                            {selectedCourseId && (
                                <div className="space-y-4 pt-2">
                                    <div className="flex flex-col gap-2">
                                        <Button variant="secondary" onClick={() => handleAddItem(selectedCourseId)} className="w-full justify-start">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Whole Course
                                        </Button>
                                    </div>

                                    <div className="border-t pt-4">
                                        <label className="text-sm font-medium mb-2 block">Or Select Specific Module</label>
                                        <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto">
                                            {allCourses.find(c => c.id === selectedCourseId)?.modules?.map((courseModule: any) => (
                                                <Button key={courseModule.id} variant="outline" size="sm" onClick={() => handleAddItem(undefined, courseModule.id)} className="justify-start">
                                                    <Plus className="w-3 h-3 mr-2 text-muted-foreground" />
                                                    {courseModule.title}
                                                </Button>
                                            ))}
                                            {(!allCourses.find(c => c.id === selectedCourseId)?.modules?.length) && (
                                                <p className="text-xs text-muted-foreground italic">No modules in this course.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <ScrollArea className="flex-1 border rounded-md p-4 bg-muted/20">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={items.map((item: any) => item.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="flex flex-col gap-2">
                            {items.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">Path is empty. Add some Courses!</p>
                            )}
                            {items.map((item: any) => (
                                <SortableItem key={item.id} id={item.id}>
                                    <div className="flex items-center gap-3 p-3 bg-card border rounded-md shadow-sm">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">
                                                {item.course?.title || item.module?.title || "Unknown Content"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.course ? "Full Course" : "Module"}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </SortableItem>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </ScrollArea>
        </div>
    )
}

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 group">
            <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground/50 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex-1">
                {children}
            </div>
        </div>
    )
}

function Combobox({ items, value, setValue }: { items: { label: string, value: string }[], value: string | null, setValue: (val: string) => void }) {
    const [open, setOpen] = useState(false)
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? items.find((item) => item.value === value)?.label
                        : "Select item..."}
                    <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50 rotate-45" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                        <CommandEmpty>No item found.</CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.label}
                                    onSelect={() => {
                                        setValue(item.value)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
