import { useState } from 'react'

export default function CourseCard({ course }: { course: { title: string, description: string, instructor: string } }) {
  const [isEnrolled, setIsEnrolled] = useState(false)

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition">
      <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
      <p className="text-gray-600 mb-4">{course.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{course.instructor}</span>
        <button
          onClick={() => setIsEnrolled(!isEnrolled)}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          {isEnrolled ? 'Enrolled' : 'Enroll Now'}
        </button>
      </div>
    </div>
  )
}
