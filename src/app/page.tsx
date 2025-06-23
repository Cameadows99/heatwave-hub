import {redirect} from 'next/navigation'

export default function HomePage() {
redirect('/home')

  return <h1 className="text-2xl font-bold">🏠 Home — Motivational Quotes</h1>
}