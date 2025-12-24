import { signIn } from '@/auth'

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn()}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
    >
      Login
    </button>
  )
}
