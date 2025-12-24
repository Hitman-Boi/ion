import LoginButton from './LoginButton'

export default function Header() {
  return (
    <header className="bg-white/10 backdrop-blur-md shadow-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Learning Hub</h1>
        <LoginButton />
      </div>
    </header>
  )
}
