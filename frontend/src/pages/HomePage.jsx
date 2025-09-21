import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function HomePage() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/upload-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      navigate(`/bill/${response.data.bill_id}`)
    } catch (err) {
      setError('Failed to upload or parse receipt. Please try again.')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="text-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <div className="flex justify-center mb-4">
          <img 
            src="/Tabby Logo.png" 
            alt="Tabby Logo" 
            className="h-12 w-12 object-contain rounded-lg"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Split Bills with a Snap</h1>
        <p className="text-gray-500 mb-6">Upload a receipt to get started.</p>
        <label
          htmlFor="receipt-upload"
          className="w-full inline-block px-6 py-10 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors"
        >
          {isUploading ? (
            <span className="text-gray-500">Uploading...</span>
          ) : (
            <span className="text-blue-600 font-semibold">Click to upload a receipt</span>
          )}
        </label>
        <input id="receipt-upload" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  )
}

export default HomePage