import React from 'react'
import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img 
            src="/Tabby Logo.png" 
            alt="Tabby Logo" 
            className="h-8 w-8 object-cover rounded-sm"
            style={{ objectPosition: 'center' }}
          />
          <span className="text-2xl font-bold text-blue-600">Tabby</span>
        </Link>
        <div className="flex gap-4">
          <Link to="/history" className="text-gray-600 hover:text-blue-600 transition-colors">History</Link>
          <Link to="/settings" className="text-gray-600 hover:text-blue-600 transition-colors">Settings</Link>
        </div>
      </nav>
    </header>
  )
}

export default Header