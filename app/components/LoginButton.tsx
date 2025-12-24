import Link from 'next/link'

export default function LoginButton() {
  return (
    <Link
      href="/login"
      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
    >
      Login
    </Link>
  )
}
