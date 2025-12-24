import { Module } from '@/types'

export default function ModuleList({ modules }: { modules: Module[] }) {
  return (
    <div className="space-y-4">
      {modules.map(module => (
        <div key={module.id} className="border-l-4 border-blue-500 pl-4 py-2">
          <h4 className="font-medium">{module.title}</h4>
          <p className="text-sm text-gray-500">{module.description}</p>
        </div>
      ))}
    </div>
  )
}
