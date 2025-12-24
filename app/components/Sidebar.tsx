export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 p-4">
      <nav className="space-y-2">
        <a href="/dashboard" className="block px-4 py-2 bg-blue-100 rounded">Dashboard</a>
        <a href="/courses" className="block px-4 py-2 hover:bg-blue-100 rounded">Courses</a>
        <a href="/enrollments" className="block px-4 py-2 hover:bg-blue-100 rounded">Enrollments</a>
      </nav>
    </aside>
  )
}
