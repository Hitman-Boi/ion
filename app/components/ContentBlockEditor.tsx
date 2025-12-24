import { useState } from 'react'

export default function ContentBlockEditor({ initialContent }: { initialContent: string }) {
  const [content, setContent] = useState(initialContent)

  return (
    <div className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-4 border rounded-lg min-h-[200px]"
        placeholder="Enter content..."
      />
      <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
        Save Changes
      </button>
    </div>
  )
}
