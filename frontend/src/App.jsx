import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Review from './pages/Review'
import Assign from './pages/Assign'
import Pay from './pages/Pay'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-900">💸 SplitSmart</h1>
          </div>
        </nav>
        
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/review/:billId" element={<Review />} />
            <Route path="/assign/:billId" element={<Assign />} />
            <Route path="/pay/:billId" element={<Pay />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
