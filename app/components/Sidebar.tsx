export default function Sidebar() {
  return (
    <aside className="w-64 bg-white/5 backdrop-blur-md p-4 border-r border-white/10">
      <nav className="space-y-2">
        <a href="/dashboard" className="block px-4 py-2 bg-white/20 text-white rounded font-medium">Dashboard</a>
        <a href="/courses" className="block px-4 py-2 text-gray-200 hover:bg-white/10 rounded transition">Courses</a>
        <a href="/enrollments" className="block px-4 py-2 text-gray-200 hover:bg-white/10 rounded transition">Enrollments</a>
      </nav>
    </aside>
  )
}
