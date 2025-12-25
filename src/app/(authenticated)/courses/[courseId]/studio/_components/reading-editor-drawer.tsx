'use client'

import { updateTopicResource } from '@/app/actions/course-editor.actions'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Loader2, Upload, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ReadingEditorDrawerProps {
    courseId: string
    resource: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onResourceUpdate: (updatedResource: any) => void
}

export function ReadingEditorDrawer({ courseId, resource, open, onOpenChange, onResourceUpdate }: ReadingEditorDrawerProps) {
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
                toast.success('PDF uploaded')
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
            toast.success('Reading material saved')
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
                        <FileText className="w-5 h-5 text-purple-400" />
                        Edit Reading Material
                    </SheetTitle>
                    <SheetDescription className="text-gray-400">
                        Add a PDF URL or upload a PDF file.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 space-y-6 mt-6">
                    <div className="space-y-2">
                        <Label className="text-sm">PDF URL</Label>
                        <Input
                            value={contentUrl}
                            onChange={(e) => setContentUrl(e.target.value)}
                            placeholder="https://example.com/document.pdf"
                            className="bg-white/5 border-white/10"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm">Or Upload PDF</Label>
                        <Button variant="outline" className="w-full relative overflow-hidden border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                            <input
                                type="file"
                                accept=".pdf"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                            />
                            <Upload className="w-4 h-4 mr-2" /> Choose PDF File
                        </Button>
                    </div>

                    {contentUrl && (
                        <div className="space-y-2">
                            <Label className="text-sm">Preview</Label>
                            <a
                                href={contentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-colors"
                            >
                                <FileText className="w-5 h-5" />
                                <span className="flex-1 truncate text-sm">{contentUrl}</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    )}
                </div>

                <div className="pt-4 mt-auto border-t border-white/10">
                    <Button onClick={handleSave} disabled={loading} className="w-full">
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save Reading Material
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
