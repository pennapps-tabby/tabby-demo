import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function BillUpload() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post('/upload-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      navigate(`/review/${response.data.bill_id}`)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload receipt. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Receipt</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="text-gray-500">
              📸 Click to upload receipt photo
            </div>
          </label>
          
          {file && (
            <div className="mt-2 text-sm text-gray-600">
              Selected: {file.name}
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Processing...' : 'Upload & Parse Receipt'}
        </button>
      </div>
    </div>
  )
}

export default BillUpload
