import LoginButton from './LoginButton'

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Learning Hub</h1>
        <LoginButton />
      </div>
    </header>
  )
}
