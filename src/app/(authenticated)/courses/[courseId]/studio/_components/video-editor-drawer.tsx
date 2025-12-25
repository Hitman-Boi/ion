'use client'

import { updateTopicResource } from '@/app/actions/course-editor.actions'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, Video } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface VideoEditorDrawerProps {
    courseId: string
    resource: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onResourceUpdate: (updatedResource: any) => void
}

export function VideoEditorDrawer({ courseId, resource, open, onOpenChange, onResourceUpdate }: VideoEditorDrawerProps) {
    const [loading, setLoading] = useState(false)
    const [contentUrl, setContentUrl] = useState(resource?.contentUrl || '')

    const handleUpload = async (file: File) => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch('/api/upload', { method: 'POST', body: formData })
            const data = await res.json()
            if (data.url) {
                setContentUrl(data.url)
                toast.success('Video uploaded')
            }
        } catch (e) {
            toast.error('Upload failed')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!resource) return
        setLoading(true)
        try {
            await updateTopicResource(resource.id, { contentUrl }, courseId)
            onResourceUpdate({ ...resource, contentUrl })
            toast.success('Video saved')
            onOpenChange(false)
        } catch (e) {
            toast.error('Save failed')
        } finally {
            setLoading(false)
        }
    }

    if (!resource) return null

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col bg-[#0f1115] border-white/10 text-white overflow-y-auto sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="text-white flex items-center gap-2">
                        <Video className="w-5 h-5 text-blue-400" />
                        Edit Video
                    </SheetTitle>
                    <SheetDescription className="text-gray-400">
                        Add a video URL or upload a video file.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 space-y-6 mt-6">
                    <div className="space-y-2">
                        <Label className="text-sm">Video URL</Label>
                        <Input
                            value={contentUrl}
                            onChange={(e) => setContentUrl(e.target.value)}
                            placeholder="https://youtube.com/... or direct video URL"
                            className="bg-white/5 border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm">Or Upload Video</Label>
                        <Button variant="outline" className="w-full relative overflow-hidden border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
                            <input
                                type="file"
                                accept="video/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                            />
                            <Upload className="w-4 h-4 mr-2" /> Choose Video File
                        </Button>
                    </div>

                    {contentUrl && (
                        <div className="space-y-2">
                            <Label className="text-sm">Preview</Label>
                            <div className="aspect-video bg-black/50 rounded-lg overflow-hidden">
                                <video
                                    src={contentUrl}
                                    controls
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 mt-auto border-t border-white/10">
                    <Button onClick={handleSave} disabled={loading} className="w-full">
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Video
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
