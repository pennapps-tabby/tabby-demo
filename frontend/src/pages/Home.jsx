import React from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="text-center">
      <div className="flex justify-center mb-6">
        <img 
          src="/Tabby Logo.png" 
          alt="Tabby Logo" 
          className="h-16 w-16 object-cover rounded-xl"
          style={{ objectPosition: 'center' }}
        />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Welcome to Tabby
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Easily split bills with friends using AI-powered receipt scanning
      </p>
      
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-4">How it works</h2>
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <span>Upload a photo of your receipt</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <span>Review the parsed items and prices</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
            <span>Assign items to people</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
            <span>Generate Venmo payment links</span>
          </div>
        </div>
        
        <button
          onClick={() => navigate('/upload')}
          className="w-full mt-8 bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700"
        >
          Start Splitting Bills
        </button>
      </div>
    </div>
  )
}

export default Home
