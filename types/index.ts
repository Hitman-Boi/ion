export type User = {
  id: string
  name: string
  email: string
  role: 'admin' | 'teacher' | 'instructor' | 'student'
  accessToken: string
}

export type Course = {
  id: string
  title: string
  description: string
  instructor: string
  modules: Module[]
}

export type Module = {
  id: string
  title: string
  description: string
  contentBlocks: ContentBlock[]
}

export type ContentBlock = {
  id: string
  title: string
  content: string
  type: 'text' | 'video' | 'quiz'
}

export type Enrollment = {
  id: string
  userId: string
  courseId: string
  status: 'pending' | 'active' | 'completed'
}
