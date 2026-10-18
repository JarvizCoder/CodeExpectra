import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-white mb-4">CodeBattle</h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Test your coding skills in the ultimate programming competition. Quiz battles, coding challenges, debugging tasks, and more!
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/register"
            className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
