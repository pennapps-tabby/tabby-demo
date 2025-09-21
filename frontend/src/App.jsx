import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './components/Header'

function App() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />
      <main className={`py-8 px-4 ${isHomePage ? 'flex items-center justify-center' : ''}`} style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className={isHomePage ? 'w-full' : 'max-w-2xl mx-auto'}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default App