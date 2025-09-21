import React from 'react'
import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">Tabby</Link>
        <div className="flex gap-4">
          <Link to="/history" className="text-gray-600 hover:text-blue-600">History</Link>
          <Link to="/settings" className="text-gray-600 hover:text-blue-600">Settings</Link>
        </div>
      </nav>
    </header>
  )
}

export default Header